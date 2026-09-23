import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Table, TableHeader, TableRow, TableCell, TableBody } from '../../components/ui/table';
import { Dropdown } from '@/components/ui/Dropdown/Dropdown';
import Pagination from '../../components/ui/Pagination/Pagination'
import { Users } from '@/types/Usuarios';
import { FetchDynamic } from '@/components/Api/FetchDynamic';
import { Button } from '@/components/ui';
import { ModalCrearUsuario } from '@/components/Modals/ModalCrearUsuario';

const Usuarios = () => {

    const [solicitudes, setSolicitudes] = useState<Users[]>([]);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const dropdownRefs = useRef<Map<string, React.RefObject<HTMLButtonElement | null>>>(new Map())

    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [totalItems, setTotalItems] = useState(0)

    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Users | null>(null)

    // const [usuarios, setUsuarios] = useState();
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [modalCrearOpen, setModalCrearOpen] = useState(false)


    const getDropdownRef = (id: string): React.RefObject<HTMLButtonElement | null> => {
        if (!dropdownRefs.current.has(id)) {
            dropdownRefs.current.set(id, React.createRef<HTMLButtonElement | null>())
        }
        return dropdownRefs.current.get(id)!
    }

    useEffect(() => {
        fetchUsuarios()
    }, [currentPage, itemsPerPage])



    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const [estadisticas, setEstadisticas] = useState({
        total: totalItems,
        activo: 0,
        inactivo: 0

    })


    const fetchUsuarios = async () => {
        try {
            setError(null)
            const response = await FetchDynamic(`/usuarios`);
            if (!response.ok) throw new Error(`Error al cargar los usuarios`)

            const result = await response.json()

            const usuarioData = result.data || []
            if (result.success) {

                setSolicitudes(usuarioData)
                setTotalItems(usuarioData.length)
            } else {
                setError('No se encontraron usuarios')
            }

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error desconocido')

        } finally {

        }
    }

    const fetchEstadisticas = async () => {
        try {
            const url = `/usuarios/estadisticas`;
            const response = await FetchDynamic(url);


            if (!response.ok) throw new Error('Error al cargar')

            const result = await response.json()

            if (result.success) {
                setEstadisticas({
                    total: result.data?.total || 0,
                    activo: result.data?.activos || 0,
                    inactivo: result.data?.inactivos || 0
                })

            }

        } catch (error) {
            console.error("Error al cargar Estadis", error)
        }

    }


    const handleEvent = () => {
        fetchUsuarios()
        fetchEstadisticas()

    }

    // Filtrar usuarios por búsqueda (client-side)
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) {
            return solicitudes;
        }

        const term = searchTerm.toLowerCase().trim();
        return solicitudes.filter(user =>
            user.nombre?.toLowerCase().includes(term) ||
            user.usuario?.toLowerCase().includes(term) ||
            user.rol?.toLowerCase().includes(term)
        );
    }, [solicitudes, searchTerm]);


    //  Paginar los datos filtrados (client-side)
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
        return filteredUsers.slice(startIndex, endIndex);
    }, [filteredUsers, currentPage, itemsPerPage]);


    //  Total de items filtrados para la paginación
    const totalFilteredItems = filteredUsers.length;

    //  Resetear a página 1 cuando cambia la búsqueda
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        fetchEstadisticas()
    }, [])


    return (
        <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="w-full max-w-full mx-auto">

                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
                            Usuarios
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Gestión de usuarios
                        </p>
                    </div>

                    {/* Tarjetas de estadisticas */}
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">

                        <div className="bg-white dark:bg-orbit-surface2/30 rounded-lg border border-gray-200 dark:border-orbit-border px-3 py-2 sm:px-4 sm:py-3">
                            <p className="text-[16px] sm:text-lg text-gray-800 dark:text-slate-200">Total Usuarios</p>
                            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">
                                {estadisticas.total.toLocaleString('es-CO')}
                            </p>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-600/50 px-3 py-2 sm:px-4 sm:py-3">
                            <p className="text-[16px] sm:text-lg font-bold text-yellow-600 dark:text-yellow-300">Activos</p>
                            <p className="text-lg sm:text-xl font-bold text-yellow-600 dark:text-yellow-400">
                                {estadisticas.activo.toLocaleString('es-CO')}
                            </p>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-300 dark:border-green-600/50 px-3 py-2 sm:px-4 sm:py-3">
                            <p className="text-[16px] sm:text-lg font-bold text-green-600 dark:text-green-300">Inactivos</p>
                            <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                                {estadisticas.inactivo.toLocaleString('es-CO')}
                            </p>
                        </div>
                    </div>

                    <div className='mb-3'>
                        <Button onClick={() => setModalCrearOpen(true)}>
                            Crear Usuarios
                        </Button>
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
                                            Nombre
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Usuario
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Rol
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Activo
                                        </TableCell>

                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Acciones
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-200 dark:divide-orbit-border">
                                    {paginatedUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">
                                                No se encontraron usuarios
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedUsers.map((solicitud, index) => {
                                            // const estadoBadge = getEstadoBadge(solicitud.estado);
                                            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1
                                            return (
                                                <TableRow
                                                    key={solicitud.id_usuario}
                                                    className="hover:bg-gray-50 dark:hover:bg-orbit-surface2/50 transition-colors"
                                                >
                                                    <TableCell className="px-4 py-3 text-md text-gray-500 dark:text-slate-400">
                                                        {globalIndex}

                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-md font-medium text-gray-900 dark:text-slate-100">
                                                        {solicitud.nombre}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-md text-center text-gray-900 dark:text-slate-300">
                                                        {solicitud.usuario}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-md text-center text-gray-900 dark:text-slate-300">
                                                        {solicitud.rol}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-md text-center text-gray-900 dark:text-slate-300">
                                                        {solicitud.activo}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <button
                                                                ref={getDropdownRef(solicitud.id_usuario.toString())}
                                                                onClick={() => {
                                                                    const id = solicitud.id_usuario.toString();
                                                                    setOpenDropdown(openDropdown === id ? null : id);
                                                                }}
                                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                            >

                                                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                                </svg>
                                                            </button>

                                                            <Dropdown

                                                                isOpen={openDropdown === solicitud.id_usuario.toString()}
                                                                onClose={() => setOpenDropdown(null)}
                                                                triggerRef={getDropdownRef(solicitud.id_usuario.toString())}>
                                                                <div className="py-1">

                                                                    <button
                                                                        onClick={() => {
                                                                            // setIdSolicitanteSeleccionado(solicitud);
                                                                            // setModalDetalleOpen(true);
                                                                            setSolicitudSeleccionada(solicitud)
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

                        {totalFilteredItems > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                itemsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                                showItemsPerPageSelector={true}
                            />
                        )}

                    </div>

                </div>
            </div>

            <ModalCrearUsuario
                isOpen={modalCrearOpen}
                onClose={() => setModalCrearOpen(false)}
                onSuccess={handleEvent}

            />
        </>
    )
}

export default Usuarios;
