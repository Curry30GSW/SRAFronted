import React, { useState, useEffect, useRef } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/table';
import { FetchDynamic } from '../../components/Api/FetchDynamic';
import { cn } from '../../utils/cn';
import {
    formatFechaHora,
    formatNumberWithDots,
    formatTelefonos
} from '../../utils/helpsVincu';
import Pagination from '../../components/ui/Pagination/Pagination';
import { Dropdown } from '../../components/ui/Dropdown/Dropdown';
// import { ModalFase2Detalle } from '../../components/Modals/ModalFase2Detalle';
// import { ModalFase2Referencias } from '../../components/Modals/ModalFase2Referencias';
import Swal from 'sweetalert2';

interface Fase2Item {
    id_fase2: number;
    id_postulacion: number;
    id_asociado: number;
    score: number;
    fecha_score: string;
    familiar1_nombre: string;
    familiar1_parentesco: string;
    familiar1_telefono: string;
    familiar2_nombre: string;
    familiar2_parentesco: string;
    familiar2_telefono: string;
    personal1_nombre: string;
    personal1_telefono: string;
    personal1_direccion: string;
    personal2_nombre: string;
    personal2_telefono: string;
    personal2_direccion: string;
    conyuge_nombre: string;
    conyuge_cedula: string;
    conyuge_telefono: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    // Datos de la postulación
    estado: string;
    nombres: string;
    apellidos: string;
    numero_documento: string;
    correo_electronico: string;
}

interface Fase2ApiResponse {
    success: boolean;
    data: Fase2Item[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    filters?: any;
}

const Fase2Gestion = () => {
    // Estado principal
    const [solicitudes, setSolicitudes] = useState<Fase2Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('');

    // Dropdown
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRefs = useRef<Map<string, React.RefObject<HTMLButtonElement | null>>>(new Map());

    // Modales
    const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Fase2Item | null>(null);

    const [modalReferenciasOpen, setModalReferenciasOpen] = useState(false);
    const [solicitudReferencias, setSolicitudReferencias] = useState<Fase2Item | null>(null);

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
    }, [currentPage, itemsPerPage, searchTerm, filtroEstado]);

    const fetchSolicitudes = async () => {
        try {
            setLoading(true);
            setError(null);

            let url = `/fase2?page=${currentPage}&limit=${itemsPerPage}`;

            if (searchTerm.trim()) {
                url += `&search=${encodeURIComponent(searchTerm.trim())}`;
            }

            if (filtroEstado) {
                url += `&estado=${filtroEstado}`;
            }

            const response = await FetchDynamic(url);
            if (!response.ok) throw new Error('Error al cargar las solicitudes en Fase 2');

            const result: Fase2ApiResponse = await response.json();
            setSolicitudes(result.data || []);
            setTotalItems(result.pagination?.total || 0);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const limpiarFiltros = () => {
        setSearchTerm('');
        setFiltroEstado('');
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const verificarReferencias = (solicitud: Fase2Item) => {
        const tieneReferencias =
            solicitud.familiar1_nombre &&
            solicitud.familiar1_parentesco &&
            solicitud.familiar1_telefono &&
            solicitud.personal1_nombre &&
            solicitud.personal1_telefono;

        return tieneReferencias;
    };

    // Estadísticas
    const estadisticas = {
        total: totalItems,
        conReferencias: solicitudes.filter(s => verificarReferencias(s)).length,
        sinReferencias: solicitudes.filter(s => !verificarReferencias(s)).length
    };

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                            Fase 2 - Gestión de Solicitudes
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Solicitudes en trámite que requieren diligenciamiento de referencias
                        </p>
                    </div>

                    {/* Tarjetas de resumen */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white dark:bg-orbit-surface2/30 rounded-lg border border-gray-200 dark:border-orbit-border px-4 py-3">
                            <p className="text-sm text-gray-500 dark:text-slate-400">Total en Fase 2</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                                {estadisticas.total}
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-300 dark:border-green-600/50 px-4 py-3">
                            <p className="text-sm text-green-600 dark:text-green-400">Con Referencias</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {estadisticas.conReferencias}
                            </p>
                            <p className="text-xs text-green-500 dark:text-green-400">
                                {(estadisticas.total > 0 ? (estadisticas.conReferencias / estadisticas.total * 100).toFixed(0) : 0)}% completado
                            </p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-600/50 px-4 py-3">
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">Sin Referencias</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {estadisticas.sinReferencias}
                            </p>
                            <p className="text-xs text-yellow-500 dark:text-yellow-400">
                                Pendientes de diligenciar
                            </p>
                        </div>
                    </div>

                    {/* Filtros y búsqueda */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, cédula o correo..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full h-9 rounded-lg border border-gray-300 dark:border-orbit-border bg-white dark:bg-orbit-surface2 px-3 text-sm text-gray-900 dark:text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={limpiarFiltros}
                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>

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
                                            Score
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Referencias
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Fecha Creación
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
                                                No se encontraron solicitudes en Fase 2
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        solicitudes.map((solicitud, index) => {
                                            const tieneReferencias = verificarReferencias(solicitud);
                                            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                                            return (
                                                <TableRow
                                                    key={solicitud.id_fase2}
                                                    className="hover:bg-gray-50 dark:hover:bg-orbit-surface2/50 transition-colors"
                                                >
                                                    <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
                                                        {globalIndex}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-slate-100">
                                                        {solicitud.nombres} {solicitud.apellidos}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm text-center text-gray-900 dark:text-slate-300">
                                                        {formatNumberWithDots(solicitud.numero_documento)}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm text-center">
                                                        <span className={cn(
                                                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                            solicitud.score >= 650
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                        )}>
                                                            {solicitud.score}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm text-center">
                                                        {tieneReferencias ? (
                                                            <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                Completas
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                </svg>
                                                                Pendientes
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm text-center text-gray-900 dark:text-slate-300">
                                                        {formatFechaHora(solicitud.fecha_creacion)}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-center">
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                                                            En trámite
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <button
                                                                ref={getDropdownRef(solicitud.id_fase2.toString())}
                                                                onClick={() => {
                                                                    const id = solicitud.id_fase2.toString();
                                                                    setOpenDropdown(openDropdown === id ? null : id);
                                                                }}
                                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                            >
                                                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                                </svg>
                                                            </button>

                                                            <Dropdown
                                                                isOpen={openDropdown === solicitud.id_fase2.toString()}
                                                                onClose={() => setOpenDropdown(null)}
                                                                triggerRef={getDropdownRef(solicitud.id_fase2.toString())}
                                                            >
                                                                <div className="py-1">
                                                                    {/* Ver detalles */}
                                                                    <button
                                                                        onClick={() => {
                                                                            setSolicitudSeleccionada(solicitud);
                                                                            setModalDetalleOpen(true);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                        Ver detalles
                                                                    </button>

                                                                    {/* Diligenciar referencias */}
                                                                    <button
                                                                        onClick={() => {
                                                                            setSolicitudReferencias(solicitud);
                                                                            setModalReferenciasOpen(true);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                        </svg>
                                                                        {tieneReferencias ? 'Editar referencias' : 'Diligenciar referencias'}
                                                                    </button>

                                                                    {/* Ver historial */}
                                                                    <button
                                                                        onClick={() => {
                                                                            console.log('Ver historial:', solicitud);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 border-t border-gray-100 dark:border-gray-700 mt-1 pt-1"
                                                                    >
                                                                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        Ver historial
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

            {/* Modales */}
            <ModalFase2Detalle
                isOpen={modalDetalleOpen}
                onClose={() => {
                    setModalDetalleOpen(false);
                    setSolicitudSeleccionada(null);
                }}
                solicitud={solicitudSeleccionada}
            />

            <ModalFase2Referencias
                isOpen={modalReferenciasOpen}
                onClose={() => {
                    setModalReferenciasOpen(false);
                    setSolicitudReferencias(null);
                }}
                solicitud={solicitudReferencias}
                onSuccess={() => {
                    fetchSolicitudes();
                }}
            />
        </>
    );
};

export default Fase2Gestion;