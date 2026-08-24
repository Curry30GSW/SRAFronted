import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/table'
import { FetchDynamic } from '../../components/Api/FetchDynamic'
import { Asociado, SegmentoData, PaginationData } from '../../types/AsociacionRetirados'
import { cn } from '@/utils/cn'
import { formatFecha, formatSalario, formatNumberWithDots, getTelefonos, getMotivoRetiro } from '@/utils/helps'
import Pagination from '../../components/ui/Pagination/Pagination'
import { Dropdown } from '../../components/ui/Dropdown/Dropdown'
import ModalCrearGestion from '../../components/Modals/ModalCrearGestion'
import { ModalVerDetalle } from '../../components/Modals/ModalVerDetalle'
import { ModalHistorialGestiones } from '../../components/Modals/ModalHistorialGestiones'
import { FiltrosAvanzados } from '../../components//filtros/FiltrosAvanzados'
import { ExportExcelButton } from '../components/ExportExcelButton'

interface ApiResponse {
    success: boolean
    data: Asociado[]
    pagination: PaginationData
    count: number
    total: number
    filters: any
}

const SegmentacionSalarial = () => {
    const [asociados, setAsociados] = useState<Asociado[]>([])
    const [segmentos, setSegmentos] = useState<SegmentoData>({ oro: [], plata: [], bronce: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterSegmento, setFilterSegmento] = useState<'todos' | 'oro' | 'plata' | 'bronce'>('todos')

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalItems, setTotalItems] = useState(0)

    // Estados para filtros
    const [filtroSalarioMin, setFiltroSalarioMin] = useState('')
    const [filtroSalarioMax, setFiltroSalarioMax] = useState('')
    const [filtroMotivo, setFiltroMotivo] = useState('')

    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const dropdownRefs = useRef<Map<string, React.RefObject<HTMLButtonElement | null>>>(new Map())

    // Estados para modales
    const [modalGestionOpen, setModalGestionOpen] = useState(false)
    const [asociadoSeleccionado, setAsociadoSeleccionado] = useState<any>(null)

    const [modalDetalleOpen, setModalDetalleOpen] = useState(false)
    const [nitSeleccionado, setNitSeleccionado] = useState<string>('')

    const [modalHistorialOpen, setModalHistorialOpen] = useState(false)
    const [cedulaHistorial, setCedulaHistorial] = useState<string>('')
    const [nombreHistorial, setNombreHistorial] = useState<string>('')

    const [sortBy, setSortBy] = useState<string>('DIST05')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    const [estadisticas, setEstadisticas] = useState({
        total: 0,
        oro: 0,
        plata: 0,
        bronce: 0
    })

    const [filtroDistrito, setFiltroDistrito] = useState('')

    const getDropdownRef = (id: string): React.RefObject<HTMLButtonElement | null> => {
        if (!dropdownRefs.current.has(id)) {
            dropdownRefs.current.set(id, React.createRef<HTMLButtonElement | null>())
        }
        return dropdownRefs.current.get(id)!
    }

    // ✅ Efecto para cargar datos
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAsociados()
        }, 300)
        return () => clearTimeout(timer)
    }, [currentPage, itemsPerPage, searchTerm, filterSegmento, filtroSalarioMin, filtroSalarioMax, filtroMotivo, sortBy, sortOrder, filtroDistrito])

    const fetchAsociados = async () => {
        try {
            setLoading(true)

            // ✅ Construir URL con todos los filtros
            let url = `/asociados?page=${currentPage}&limit=${itemsPerPage}`

            // Filtros básicos
            if (searchTerm.trim()) {
                url += `&search=${encodeURIComponent(searchTerm.trim())}`
            }

            if (filterSegmento !== 'todos') {
                url += `&segmento=${filterSegmento}`
            }

            if (filtroMotivo) {
                url += `&motivo=${filtroMotivo}`
            }

            if (filtroSalarioMin) {
                url += `&salarioMin=${filtroSalarioMin}`
            }

            if (filtroSalarioMax) {
                url += `&salarioMax=${filtroSalarioMax}`
            }

            if (filtroDistrito && filtroDistrito !== 'todos') {
                url += `&distrito=${filtroDistrito}`
            }

            // ✅ Ordenamiento
            if (sortBy) {
                url += `&sortBy=${sortBy}&sortOrder=${sortOrder}`
            }

            const response = await FetchDynamic(url)
            if (!response.ok) throw new Error('Error al cargar los asociados')

            const result: ApiResponse = await response.json()
            const asociadosData = result.data || []

            setAsociados(asociadosData)
            setTotalItems(result.pagination?.total || asociadosData.length)

            const segmentados = segmentarAsociados(asociadosData)
            setSegmentos(segmentados)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

    const fetchEstadisticas = async () => {
        try {
            const queryParams = new URLSearchParams()

            if (searchTerm.trim()) {
                queryParams.append('search', searchTerm.trim())
            }

            const response = await FetchDynamic(`/asociados/estadisticas?${queryParams.toString()}`)
            if (!response.ok) throw new Error('Error al cargar estadísticas')

            const result = await response.json()
            setEstadisticas({
                total: result.total || 0,
                oro: result.oro || 0,
                plata: result.plata || 0,
                bronce: result.bronce || 0
            })
        } catch (err) {
            console.error('Error cargando estadísticas:', err)
        }
    }

    useEffect(() => {
        fetchEstadisticas()
    }, [searchTerm])

    const segmentarAsociados = (data: Asociado[]): SegmentoData => {
        const oro: Asociado[] = []
        const plata: Asociado[] = []
        const bronce: Asociado[] = []

        data.forEach((asociado) => {
            const salario = parseFloat(asociado.BASE05)

            if (salario >= 5000000) {
                oro.push(asociado)
            } else if (salario >= 3500000 && salario <= 4999999) {
                plata.push(asociado)
            } else {
                bronce.push(asociado)
            }
        })

        const sortBySalary = (a: Asociado, b: Asociado) => parseFloat(b.BASE05) - parseFloat(a.BASE05)
        oro.sort(sortBySalary)
        plata.sort(sortBySalary)
        bronce.sort(sortBySalary)

        return { oro, plata, bronce }
    }

    const filteredAsociados = asociados

    const getSegmentoColor = (segmento: string) => {
        switch (segmento) {
            case 'oro': return 'bg-yellow-300/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
            case 'plata': return 'bg-gray-400/20 text-gray-700 dark:text-gray-300 border-gray-400/30'
            case 'bronce': return 'bg-amber-800/20 text-amber-700 dark:text-amber-500 border-amber-700/30'
            default: return ''
        }
    }

    const getSegmentoBadge = (segmento: string) => {
        switch (segmento) {
            case 'oro': return 'Oro'
            case 'plata': return 'Plata'
            case 'bronce': return 'Bronce'
            default: return ''
        }
    }

    // ✅ Función para limpiar todos los filtros
    const limpiarFiltros = () => {
        setFiltroDistrito('')
        setFiltroSalarioMin('')
        setFiltroSalarioMax('')
        setFiltroMotivo('')
        setSearchTerm('')
        setFilterSegmento('todos')
        setSortBy('DIST05')
        setSortOrder('asc')
        setCurrentPage(1)
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(1)
    }

    const filtrosParaExport = useMemo(() => {
        return {
            search: searchTerm || undefined,
            distrito: filtroDistrito || undefined,
            motivo: filtroMotivo || undefined,
            salarioMin: filtroSalarioMin || undefined,
            salarioMax: filtroSalarioMax || undefined,
            segmento: filterSegmento !== 'todos' ? filterSegmento : undefined,
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined,
        };

    }, [searchTerm, filtroDistrito, filtroMotivo, filterSegmento, filtroSalarioMax, filtroSalarioMin, sortBy, sortOrder]);


    const hasActiveFilters = useMemo(() => {
        return Boolean(
            filtroDistrito ||
            filtroMotivo ||
            filterSegmento !== 'todos' ||
            filtroSalarioMin ||
            filtroSalarioMax ||
            searchTerm
        );
    }, [filtroDistrito, filtroMotivo, filterSegmento, filtroSalarioMin, filtroSalarioMax, searchTerm]);

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex-1 overflow-y-auto p-6">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400">Error: {error}</p>
                    <button
                        onClick={fetchAsociados}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="w-full max-w-full mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
                            Asociados Retirados
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            Clasificación de asociados por rango de salario
                        </p>
                    </div>

                    {/* Tarjetas de resumen */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
                        {/* Total */}
                        <div className="bg-white dark:bg-orbit-surface2/30 rounded-lg border border-gray-200 dark:border-orbit-border px-3 py-2 sm:px-4 sm:py-3">
                            <p className="text-[16px] sm:text-lg text-gray-500 dark:text-slate-400">Total</p>
                            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">
                                {estadisticas.total.toLocaleString('es-CO')}
                            </p>
                        </div>

                        {/* Oro - Amarillo/dorado */}
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-300 dark:border-yellow-600/50 px-3 py-2 sm:px-4 sm:py-3">
                            <p className="text-[16px] sm:text-lg font-bold text-yellow-600 dark:text-yellow-300">Oro</p>
                            <p className="text-lg sm:text-xl font-bold text-yellow-600 dark:text-yellow-400">
                                {estadisticas.oro.toLocaleString('es-CO')}
                            </p>
                            <p className="text-[14px] sm:text-[14px] text-yellow-600 dark:text-yellow-400/70">≥ $5.000.000</p>
                        </div>

                        {/* Plata - Gris con brillo metálico */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800/50 dark:to-gray-700/30 rounded-lg border border-gray-300 dark:border-gray-600/50 px-3 py-2 sm:px-4 sm:py-3">
                            <p className="text-[16px] sm:text-lg font-bold text-gray-700 dark:text-gray-300">Plata</p>
                            <p className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-200">
                                {estadisticas.plata.toLocaleString('es-CO')}
                            </p>
                            <p className="text-[14px] sm:text-[14px] text-gray-500 dark:text-gray-400/70">$3.5M - $4.9M</p>
                        </div>

                        {/* Bronce - Cobre/naranja */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-300 dark:border-orange-600/50 px-3 py-2 sm:px-4 sm:py-3">
                            <p className="text-[16px] sm:text-lg font-bold text-orange-600 dark:text-orange-300">Bronce</p>
                            <p className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400">
                                {estadisticas.bronce.toLocaleString('es-CO')}
                            </p>
                            <p className="text-[14px] sm:text-[14px] text-orange-600 dark:text-orange-400/70">&lt; $3.5M</p>
                        </div>
                    </div>

                    <div className='mb-3'>
                        <ExportExcelButton
                            filtros={filtrosParaExport}
                            datosOriginales={asociados}
                            datosFiltrados={filteredAsociados}
                            filtrosActivos={hasActiveFilters}
                        />
                    </div>


                    {/* ✅ Filtros y búsqueda */}
                    <FiltrosAvanzados
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filtroSalarioMin={filtroSalarioMin}
                        setFiltroSalarioMin={setFiltroSalarioMin}
                        filtroSalarioMax={filtroSalarioMax}
                        setFiltroSalarioMax={setFiltroSalarioMax}
                        filtroMotivo={filtroMotivo}
                        setFiltroMotivo={setFiltroMotivo}
                        filterSegmento={filterSegmento}
                        setFilterSegmento={setFilterSegmento}
                        limpiarFiltros={limpiarFiltros}
                        getSegmentoBadge={getSegmentoBadge}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        resetToFirstPage={() => setCurrentPage(1)}
                        onAplicarFiltros={() => setCurrentPage(1)}
                        filtroDistrito={filtroDistrito}
                        setFiltroDistrito={setFiltroDistrito}
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
                                            Agencia
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-left text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Nombres
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Cédula
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Ciudad
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-left text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Teléfono
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-left text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Nómina
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Fecha Retiro
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-right text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Salario
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Clasificación
                                        </TableCell>
                                        <TableCell isHeader className="px-4 py-3 text-center text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                            Acciones
                                        </TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-200 dark:divide-orbit-border">
                                    {filteredAsociados.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">
                                                No se encontraron asociados
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredAsociados.map((asociado, index) => {
                                            const salario = parseFloat(asociado.BASE05)
                                            let segmento = 'bronce'
                                            if (salario >= 5000000) segmento = 'oro'
                                            else if (salario >= 3500000) segmento = 'plata'

                                            const globalIndex = (currentPage - 1) * itemsPerPage + index + 1

                                            return (
                                                <TableRow
                                                    key={asociado.NCTA05 || index}
                                                    className="hover:bg-gray-50 dark:hover:bg-orbit-surface2/50 transition-colors"
                                                >
                                                    <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
                                                        {globalIndex}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-slate-100">
                                                        {asociado.DIST05} - {asociado.DESC03}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-slate-100">
                                                        {asociado.DESC05}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm text-center text-gray-900 dark:text-slate-300">
                                                        {formatNumberWithDots(asociado.NNIT05)}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm text-center text-gray-900 dark:text-slate-300">
                                                        {asociado.CIUD05}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-slate-300">
                                                        {getTelefonos(asociado)}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm text-left text-gray-900 dark:text-slate-300">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-900 dark:text-gray-200 font-medium text-sm">{asociado.DESC04}</span>
                                                            <span className="text-red-600 dark:text-red-400 font-medium text-sm">
                                                                {getMotivoRetiro(asociado.MORE05)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm text-center text-gray-900 dark:text-slate-300">
                                                        {formatFecha(asociado.FRDA05)}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-slate-100">
                                                        {formatSalario(asociado.BASE05)}
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-center">
                                                        <span className={cn(
                                                            'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border',
                                                            getSegmentoColor(segmento)
                                                        )}>
                                                            {getSegmentoBadge(segmento)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <button
                                                                ref={getDropdownRef(asociado.NCTA05 || index.toString())}
                                                                onClick={() => {
                                                                    const id = asociado.NCTA05 || index.toString()
                                                                    setOpenDropdown(openDropdown === id ? null : id)
                                                                }}
                                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                            >
                                                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                                </svg>
                                                            </button>

                                                            <Dropdown
                                                                isOpen={openDropdown === (asociado.NCTA05 || index.toString())}
                                                                onClose={() => setOpenDropdown(null)}
                                                                triggerRef={getDropdownRef(asociado.NCTA05 || index.toString())}
                                                            >
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            setNitSeleccionado(asociado.NNIT05)
                                                                            setModalDetalleOpen(true)
                                                                            setOpenDropdown(null)
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
                                                                            setCedulaHistorial(asociado.NNIT05)
                                                                            setNombreHistorial(asociado.DESC05)
                                                                            setModalHistorialOpen(true)
                                                                            setOpenDropdown(null)
                                                                        }}
                                                                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                        Ver historial
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setAsociadoSeleccionado(asociado)
                                                                            setModalGestionOpen(true)
                                                                            setOpenDropdown(null)
                                                                        }}
                                                                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                        </svg>
                                                                        Crear gestión
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            console.log('Cambiar estado:', asociado)
                                                                            setOpenDropdown(null)
                                                                        }}
                                                                        className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                                        </svg>
                                                                        Cambiar estado
                                                                    </button>
                                                                </div>
                                                            </Dropdown>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
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

            <ModalCrearGestion
                isOpen={modalGestionOpen}
                onClose={() => {
                    setModalGestionOpen(false)
                    setAsociadoSeleccionado(null)
                }}
                onSuccess={() => {
                    console.log('Gestión creada exitosamente')
                }}
                asociado={asociadoSeleccionado}
            />

            <ModalVerDetalle
                isOpen={modalDetalleOpen}
                onClose={() => {
                    setModalDetalleOpen(false)
                    setNitSeleccionado('')
                }}
                nit={nitSeleccionado}
            />

            <ModalHistorialGestiones
                isOpen={modalHistorialOpen}
                onClose={() => {
                    setModalHistorialOpen(false)
                    setCedulaHistorial('')
                    setNombreHistorial('')
                }}
                cedula={cedulaHistorial}
                nombre={nombreHistorial}
            />
        </>
    )
}

export default SegmentacionSalarial