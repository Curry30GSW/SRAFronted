import { useState, useEffect } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../../components/ui/table'
import { FetchDynamic } from '../../components/Api/FetchDynamic'
import { Asociado, SegmentoData, PaginationData } from '../../types/AsociacionRetirados'
import { cn } from '@/utils/cn'
import Pagination from '../../components/ui/Pagination/Pagination'

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

    // ✅ Estados de paginación
    const [currentPage, setCurrentPage] = useState(1S

    )
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [totalItems, setTotalItems] = useState(0)

    // ✅ Efecto para cargar datos cuando cambia la página o items por página
    useEffect(() => {
        fetchAsociados()
    }, [currentPage, itemsPerPage])

    // ✅ Resetear página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filterSegmento])

    // ✅ Efecto para recargar cuando se resetea la página
    useEffect(() => {
        if (currentPage === 1) {
            fetchAsociados()
        }
    }, [currentPage])

    const fetchAsociados = async () => {
        try {
            setLoading(true)

            // ✅ Enviar parámetros de paginación al backend
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString()
            })

            // ✅ Si hay búsqueda, enviarla al backend
            if (searchTerm.trim()) {
                queryParams.append('search', searchTerm.trim())
            }

            // ✅ Si hay filtro de segmento, enviarlo (esto se maneja en el frontend)
            // Nota: La segmentación por salario se hace en el frontend

            const response = await FetchDynamic(`/asociados?${queryParams.toString()}`)
            if (!response.ok) throw new Error('Error al cargar los asociados')

            const result: ApiResponse = await response.json()

            // ✅ Los datos vienen directamente en result.data (no anidado)
            const asociadosData = result.data || []

            if (!Array.isArray(asociadosData)) {
                console.error('Los datos no son un array:', asociadosData)
                setAsociados([])
                setSegmentos({ oro: [], plata: [], bronce: [] })
                setTotalItems(0)
                return
            }

            setAsociados(asociadosData)
            setTotalItems(result.pagination?.total || asociadosData.length)

            // ✅ Segmentar los asociados (solo los datos de la página actual)
            const segmentados = segmentarAsociados(asociadosData)
            setSegmentos(segmentados)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

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

        // Ordenar cada segmento por salario descendente
        const sortBySalary = (a: Asociado, b: Asociado) => parseFloat(b.BASE05) - parseFloat(a.BASE05)
        oro.sort(sortBySalary)
        plata.sort(sortBySalary)
        bronce.sort(sortBySalary)

        return { oro, plata, bronce }
    }

    // ✅ Filtrar por segmento en el frontend (los datos ya vienen paginados del backend)
    const getFilteredAsociados = () => {
        let filtered: Asociado[] = []

        if (filterSegmento === 'todos') {
            filtered = [...asociados]
        } else {
            filtered = segmentos[filterSegmento as keyof SegmentoData] || []
        }

        // ✅ La búsqueda ya se maneja en el backend, pero también podemos filtrar localmente
        // si queremos una búsqueda más rápida (opcional)
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim()
            filtered = filtered.filter((a) =>
                a.DESC05?.toLowerCase().includes(term) ||
                a.NNIT05?.includes(term) ||
                a.CIUD05?.toLowerCase().includes(term)
            )
        }

        return filtered
    }

    const filteredAsociados = getFilteredAsociados()

    // Estadísticas (solo de los datos actuales)
    const totalAsociados = totalItems
    const totalOro = segmentos.oro.length
    const totalPlata = segmentos.plata.length
    const totalBronce = segmentos.bronce.length

    const getSegmentoColor = (segmento: string) => {
        switch (segmento) {
            case 'oro': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30'
            case 'plata': return 'bg-gray-400/20 text-gray-700 dark:text-gray-400 border-gray-400/30'
            case 'bronce': return 'bg-amber-700/20 text-amber-700 dark:text-amber-500 border-amber-700/30'
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

    const formatSalario = (salario: string) => {
        const num = parseFloat(salario)
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num)
    }

    // ✅ Manejar cambio de página
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // ✅ Manejar cambio de items por página
    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(1)
    }

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-orbit-surface2/30 rounded-lg border border-gray-200 dark:border-orbit-border p-4">
                        <p className="text-sm text-gray-500 dark:text-slate-400">Total Asociados</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{totalAsociados}</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">🥇 Oro</p>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{totalOro}</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-500">≥ $5.000.000</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <p className="text-sm text-gray-700 dark:text-gray-400">🥈 Plata</p>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-400">{totalPlata}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-500">$3.500.000 - $4.999.999</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
                        <p className="text-sm text-amber-700 dark:text-amber-400">🥉 Bronce</p>
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{totalBronce}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-500">&lt; $3.500.000</p>
                    </div>
                </div>

                {/* Filtros y búsqueda */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, cédula o ciudad..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1) // Resetear a primera página al buscar
                            }}
                            className="w-full h-9 rounded-lg border border-gray-300 dark:border-orbit-border bg-white dark:bg-orbit-surface2 px-3 text-sm text-gray-900 dark:text-slate-200 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {['todos', 'oro', 'plata', 'bronce'].map((seg) => (
                            <button
                                key={seg}
                                onClick={() => {
                                    setFilterSegmento(seg as typeof filterSegmento)
                                    setCurrentPage(1) // Resetear a primera página al filtrar
                                }}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                                    filterSegmento === seg
                                        ? 'bg-green-700 text-white'
                                        : 'bg-white dark:bg-orbit-surface2 border border-gray-300 dark:border-orbit-border text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-orbit-surface3'
                                )}
                            >
                                {seg === 'todos' ? 'Todos' : getSegmentoBadge(seg)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white dark:bg-orbit-surface2/30 rounded-lg border border-gray-200 dark:border-orbit-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table className="w-full">
                            <TableHeader className="bg-gray-50 dark:bg-orbit-surface2/50 border-b border-gray-200 dark:border-orbit-border">
                                <TableRow>
                                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                                        #
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                                        Asociado
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                                        Cédula
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                                        Ciudad
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                                        Salario
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                                        Segmento
                                    </TableCell>
                                    <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                                        WhatsApp
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-200 dark:divide-orbit-border">
                                {filteredAsociados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">
                                            No se encontraron asociados
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAsociados.map((asociado, index) => {
                                        const salario = parseFloat(asociado.BASE05)
                                        let segmento = 'bronce'
                                        if (salario >= 5000000) segmento = 'oro'
                                        else if (salario >= 3500000) segmento = 'plata'

                                        // ✅ Calcular índice global
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
                                                    {asociado.DESC05}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">
                                                    {asociado.NNIT05}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">
                                                    {asociado.CIUD05}
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
                                                <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-slate-300">
                                                    {asociado.WHA105 || asociado.TCEL05 || 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* ✅ Paginación con datos del backend */}
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
    )
}

export default SegmentacionSalarial