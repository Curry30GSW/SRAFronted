import React, { useState, useEffect, useRef } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/table';
import { FetchDynamic } from '../../components/Api/FetchDynamic';
import { Vinculacion, VinculacionApiResponse } from '../../types/Vinculacion';
import { cn } from '../../utils/cn';
import {
    formatFechaHora,
    formatNumberWithDots,
    getEstadoBadge,
    getTipoTrabajadorLabel,
    formatTelefonos
} from '../../utils/helpsVincu';
import Pagination from '../../components/ui/Pagination/Pagination';
import { Dropdown } from '../../components/ui/Dropdown/Dropdown';
import { FiltrosVinculacion } from '../../components/filtros/FiltrosVinculacion';
import { ModalVerDetalleVinculacion } from '../../components/Modals/ModalVerDetalleVinculacion';
import { ModalCambiarEstado } from '../../components/Modals/ModalCambiarEstado';
import { generarPDFVinculacion } from '../../components/pdf/FormatoVinculacionF1PDF';
import Swal from 'sweetalert2';

const Fase1Asociacion = () => {
    // Estado principal
    const [solicitudes, setSolicitudes] = useState<Vinculacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroTipoDocumento, setFiltroTipoDocumento] = useState('');
    const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
    const [filtroFechaFin, setFiltroFechaFin] = useState('');

    // Ordenamiento
    const [sortBy, setSortBy] = useState<string>('fecha_creacion');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Dropdown
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRefs = useRef<Map<string, React.RefObject<HTMLButtonElement | null>>>(new Map());

    // Modales
    const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
    const [idSolicitanteSeleccionado, setIdSolicitanteSeleccionado] = useState<number | null>(null);

    const [modalCambiarEstadoOpen, setModalCambiarEstadoOpen] = useState(false);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<any>(null);

    // Estadísticas
    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        pendientes: 0,
        aprobados: 0,
        rechazados: 0,
        enRevision: 0
    });

    const [solicitudActual, setSolicitudActual] = useState<Vinculacion | null>(null);

    const getDropdownRef = (id: string): React.RefObject<HTMLButtonElement | null> => {
        if (!dropdownRefs.current.has(id)) {
            dropdownRefs.current.set(id, React.createRef<HTMLButtonElement | null>());
        }
        return dropdownRefs.current.get(id)!;
    };

    // Cargar datos
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSolicitudes();
        }, 300);
        return () => clearTimeout(timer);
    }, [
        currentPage,
        itemsPerPage,
        searchTerm,
        filtroEstado,
        filtroTipoDocumento,
        filtroFechaInicio,
        filtroFechaFin,
        sortBy,
        sortOrder
    ]);

    const fetchSolicitudes = async () => {
        try {
            setLoading(true);
            setError(null);

            let url = `/vinculacion?page=${currentPage}&limit=${itemsPerPage}`;

            if (searchTerm.trim()) {
                url += `&search=${encodeURIComponent(searchTerm.trim())}`;
            }

            if (filtroEstado) {
                url += `&estado=${filtroEstado}`;
            }

            if (filtroTipoDocumento) {
                url += `&tipoDocumento=${filtroTipoDocumento}`;
            }

            if (filtroFechaInicio) {
                url += `&fechaInicio=${filtroFechaInicio}`;
            }

            if (filtroFechaFin) {
                url += `&fechaFin=${filtroFechaFin}`;
            }

            if (sortBy) {
                url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`;
            }

            const response = await FetchDynamic(url);
            if (!response.ok) throw new Error('Error al cargar las solicitudes');

            const result: VinculacionApiResponse = await response.json();
            setSolicitudes(result.data || []);
            setTotalItems(result.pagination?.total || 0);

            // Calcular estadísticas
            const data = result.data || [];
            setEstadisticas({
                total: data.length,
                pendientes: data.filter(s => s.estado === 'PENDIENTE').length,
                aprobados: data.filter(s => s.estado === 'APROBADO').length,
                rechazados: data.filter(s => s.estado === 'RECHAZADO').length,
                enRevision: data.filter(s => s.estado === 'EN_REVISION').length
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const limpiarFiltros = () => {
        setSearchTerm('');
        setFiltroEstado('');
        setFiltroTipoDocumento('');
        setFiltroFechaInicio('');
        setFiltroFechaFin('');
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const handleGenerarPDF = async (solicitud: Vinculacion) => {
        try {
            // Mostrar loading
            Swal.fire({
                title: 'Generando PDF...',
                text: 'Obteniendo datos del solicitante',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // ✅ Obtener los datos completos del solicitante usando el ID
            const response = await FetchDynamic(`/vinculacion/${solicitud.id_solicitante}`);
            if (!response.ok) {
                throw new Error('Error al obtener los datos completos del solicitante');
            }

            const result = await response.json();
            const datosCompletos = result.data;
            // ✅ Generar PDF con los datos completos
            await generarPDFVinculacion(datosCompletos, 'ASOCIADO');

            await Swal.fire({
                icon: 'success',
                title: 'PDF Generado',
                text: 'El documento se ha generado correctamente',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('❌ Error al generar PDF:', error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error instanceof Error ? error.message : 'No se pudo generar el PDF. Intenta nuevamente.'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 overflow-y-auto p-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400">Error: {error}</p>
                    <button
                        onClick={fetchSolicitudes}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="w-full max-w-full mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
                            Fase 1 - Solicitudes de Vinculación
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Gestión de solicitudes de asociación
                        </p>
                    </div>

                    {/* Tarjetas de resumen */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-4">
                        <div className="bg-white dark:bg-orbit-surface2/30 rounded-lg border border-gray-200 dark:border-orbit-border px-3 py-2 sm:px-4 sm:py-3">
                            <p className="text-[16px] sm:text-lg text-gray-500 dark:text-slate-400">Total</p>
                            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">
                                {estadisticas.total}
                            </p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-600/50 px-3 py-2 sm:px-4 sm:py-3">
                            <p className="text-[16px] sm:text-lg font-bold text-yellow-600 dark:text-yellow-300">Pendientes</p>
                            <p className="text-lg sm:text-xl font-bold text-yellow-600 dark:text-yellow-400">
                                {estadisticas.pendientes}
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-300 dark:border-green-600/50 px-3 py-2 sm:px-4 sm:py-3">
                            <p className="text-[16px] sm:text-lg font-bold text-green-600 dark:text-green-300">Aprobados</p>
                            <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                                {estadisticas.aprobados}
                            </p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-300 dark:border-red-600/50 px-3 py-2 sm:px-4 sm:py-3">
                            <p className="text-[16px] sm:text-lg font-bold text-red-600 dark:text-red-300">Rechazados</p>
                            <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                                {estadisticas.rechazados}
                            </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-300 dark:border-blue-600/50 px-3 py-2 sm:px-4 sm:py-3">
                            <p className="text-[16px] sm:text-lg font-bold text-blue-600 dark:text-blue-300">En Revisión</p>
                            <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                                {estadisticas.enRevision}
                            </p>
                        </div>
                    </div>

                    {/* Filtros */}
                    <FiltrosVinculacion
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filtroEstado={filtroEstado}
                        setFiltroEstado={setFiltroEstado}
                        filtroTipoDocumento={filtroTipoDocumento}
                        setFiltroTipoDocumento={setFiltroTipoDocumento}
                        filtroFechaInicio={filtroFechaInicio}
                        setFiltroFechaInicio={setFiltroFechaInicio}
                        filtroFechaFin={filtroFechaFin}
                        setFiltroFechaFin={setFiltroFechaFin}
                        limpiarFiltros={limpiarFiltros}
                    />

                    {/* Tabla */}
                    <div className="bg-white dark:bg-orbit-surface2/30 rounded-lg border border-gray-200 dark:border-orbit-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table className="w-full">
                                <TableHeader className="bg-gray-50 dark:bg-orbit-surface2/50 border-b border-gray-200 dark:border-orbit-border">
                                    <TableRow>
                                        <TableCell isHeader className="px-4 py-3 text-left text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            #
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-left text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Solicitante
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Cédula
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Correo
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Telefono
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Fecha Solicitud
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Estado
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Acciones
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-200 dark:divide-orbit-border">
                                    {solicitudes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">
                                                No se encontraron solicitudes
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        solicitudes.map((solicitud) => {
                                            const estadoBadge = getEstadoBadge(solicitud.estado);

                                            return (
                                                <TableRow
                                                    key={solicitud.id_solicitante}
                                                    className="hover:bg-gray-50 dark:hover:bg-orbit-surface2/50 transition-colors"
                                                >
                                                    <TableCell className="px-4 py-3 text-md text-gray-500 dark:text-slate-400">
                                                        {solicitud.id_solicitante}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-md font-medium text-gray-900 dark:text-slate-100">
                                                        <div>
                                                            <div>{solicitud.nombres} {solicitud.apellidos}</div>
                                                            <div className="text-xs text-gray-500 dark:text-slate-400">
                                                                {getTipoTrabajadorLabel(solicitud.tipo_trabajador)}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-md text-center text-gray-900 dark:text-slate-300">
                                                        {formatNumberWithDots(solicitud.numero_documento)}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-md text-center text-gray-900 dark:text-slate-300">
                                                        {solicitud.correo_electronico}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-md text-left text-gray-900 dark:text-slate-300">
                                                        {formatTelefonos(solicitud.telefonos, ' - ')}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-md text-center text-gray-900 dark:text-slate-300">
                                                        {formatFechaHora(solicitud.fecha_creacion)}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-center">
                                                        <span className={cn(
                                                            'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border',
                                                            estadoBadge.color
                                                        )}>
                                                            {estadoBadge.label}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <button
                                                                ref={getDropdownRef(solicitud.id_solicitante.toString())}
                                                                onClick={() => {
                                                                    const id = solicitud.id_solicitante.toString();
                                                                    setOpenDropdown(openDropdown === id ? null : id);
                                                                }}
                                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                            >
                                                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                                </svg>
                                                            </button>

                                                            <Dropdown
                                                                isOpen={openDropdown === solicitud.id_solicitante.toString()}
                                                                onClose={() => setOpenDropdown(null)}
                                                                triggerRef={getDropdownRef(solicitud.id_solicitante.toString())}
                                                            >
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            setIdSolicitanteSeleccionado(solicitud.id_solicitante);
                                                                            setModalDetalleOpen(true);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                        Ver detalles
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            console.log('Editar solicitud:', solicitud);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        Editar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSolicitudSeleccionada(solicitud);
                                                                            setModalCambiarEstadoOpen(true);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                        </svg>
                                                                        Cambiar estado
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleGenerarPDF(solicitud);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 mt-1 pt-1"
                                                                    >
                                                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v6m3-3H9" />
                                                                        </svg>
                                                                        Generar PDF
                                                                    </button>
                                                                </div>
                                                            </Dropdown>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                            itemsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                            showItemsPerPageSelector={true}
                        />
                    </div>
                </div>
            </div>

            {/* Modal de Detalle */}
            <ModalVerDetalleVinculacion
                isOpen={modalDetalleOpen}
                onClose={() => {
                    setModalDetalleOpen(false);
                    setIdSolicitanteSeleccionado(null);
                }}
                idSolicitante={idSolicitanteSeleccionado}
            />
            {/* Modal de Cambiar Estado */}
            <ModalCambiarEstado
                isOpen={modalCambiarEstadoOpen}
                onClose={() => {
                    setModalCambiarEstadoOpen(false);
                    setSolicitudSeleccionada(null);
                }}
                solicitud={solicitudSeleccionada}
                onSuccess={() => {
                    fetchSolicitudes();
                }}
            />
        </>
    );
};

export default Fase1Asociacion;