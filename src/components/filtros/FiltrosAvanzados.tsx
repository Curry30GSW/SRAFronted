import React, { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'

interface FiltrosAvanzadosProps {
    searchTerm: string
    setSearchTerm: (value: string) => void
    filtroSalarioMin: string
    setFiltroSalarioMin: (value: string) => void
    filtroSalarioMax: string
    setFiltroSalarioMax: (value: string) => void
    filtroMotivo: string
    setFiltroMotivo: (value: string) => void
    filterSegmento: 'todos' | 'oro' | 'plata' | 'bronce'
    setFilterSegmento: (value: 'todos' | 'oro' | 'plata' | 'bronce') => void
    limpiarFiltros: () => void
    getSegmentoBadge: (segmento: string) => string
    sortBy: string
    setSortBy: (value: string) => void
    sortOrder: 'asc' | 'desc'
    setSortOrder: (value: 'asc' | 'desc') => void
    resetToFirstPage: () => void
    onAplicarFiltros?: () => void
    filtroDistrito: string           // ✅
    setFiltroDistrito: (value: string) => void  // ✅
}

const MOTIVOS_RETIRO = [
    { value: '', label: 'Todos' },
    { value: '01', label: 'Adquirió crédito con otra entidad' },
    { value: '04', label: 'Convenio Cancelado' },
    { value: '17', label: 'Capacidad de pago negativa' },
    { value: '19', label: 'Jubilado' },
    { value: '20', label: 'Embargo' },
    { value: '26', label: 'Excluido' },
    { value: '28', label: 'Licencia no remunerada' },
    { value: '32', label: 'Tabulado Falso' },
    { value: '51', label: 'Incapacidad Permanente' },
    { value: '58', label: 'Mala atención' },
    { value: '66', label: 'Nuestros servicios no le satisfacen' },
    { value: '67', label: 'Otras obligaciones' },
    { value: '68', label: 'Retiro del cargo' },
    { value: '75', label: 'Pensión compartida' },
    { value: '81', label: 'Supersolidaria' },
    { value: '82', label: 'Fraude falsificación documentos' },
    { value: '83', label: 'Cambio de nombre ley 1260 de 1970' }
]

const AGENCIAS = [
    { value: '', label: 'Todas las agencias' },
    { value: '31', label: 'CALI' },
    { value: '32', label: 'PALMIRA' },
    { value: '33', label: 'B/TURA' },
    { value: '34', label: 'BUGA' },
    { value: '35', label: 'TULUA' },
    { value: '36', label: 'SEVILLA' },
    { value: '37', label: 'LA UNION' },
    { value: '38', label: 'ROLDANILLO' },
    { value: '39', label: 'CARTAGO' },
    { value: '40', label: 'ZARZAL' },
    { value: '41', label: 'CAICEDONIA' },
    { value: '21', label: 'ZONA CENTRO' },
    { value: '80', label: 'MEDELLIN' },
    { value: '90', label: 'BOGOTA CENTRO' },
    { value: '70', label: 'MANIZALES' },
    { value: '74', label: 'PEREIRA' },
    { value: '78', label: 'ARMENIA' },
    { value: '87', label: 'BARRANQUILLA' },
    { value: '86', label: 'CARTAGENA' },
    { value: '95', label: 'IBAGUE' },
    { value: '45', label: 'PASTO' },
    { value: '94', label: 'TUNJA' },
    { value: '97', label: 'BUCARAMANGA' },
    { value: '98', label: 'CUCUTA' },
    { value: '22', label: 'ZONA NORTE' },
    { value: '10', label: 'CALI' },
    { value: '91', label: 'BOGOTA T.C.' },
    { value: '48', label: 'LETICIA' },
    { value: '81', label: 'MONTERIA' },
    { value: '92', label: 'BOGOTA NORTE' },
    { value: '82', label: 'SINCELEJO' },
    { value: '23', label: 'ZONA SUR' },
    { value: '43', label: 'YUMBO' },
    { value: '44', label: 'JAMUNDI' },
    { value: '83', label: 'YOPAL' },
    { value: '46', label: 'POPAYAN' },
    { value: '93', label: 'VILLAVICENCIO' },
    { value: '96', label: 'NEIVA' },
    { value: '84', label: 'RIOHACHA' },
    { value: '85', label: 'VALLEDUPAR' },
    { value: '88', label: 'SANTA MARTA' },
    { value: '89', label: 'DUITAMA' },
    { value: '49', label: 'PUERTO ASIS' },
    { value: '79', label: 'TOLEMAIDA' },
    { value: '42', label: 'S/DER DE QUILICHAO' },
    { value: '47', label: 'IPIALES' },
    { value: '69', label: 'QUIBDO' },
    { value: '77', label: 'SAN ANDRES' },
    { value: '75', label: 'BOGOTA GOBERNACION' },
    { value: '76', label: 'GIRARDOT' },
    { value: '73', label: 'ZIPAQUIRA' },
    { value: '72', label: 'FUSAGASUGA' },
    { value: '68', label: 'SOACHA' },
    { value: '67', label: 'FACATATIVA' },
    { value: '13', label: 'BOGOTA ELEMENTO' },
    { value: '30', label: 'CALI BC' },
    { value: '29', label: 'CASO PROCESO DE INVESTIGACION' },
    { value: '28', label: 'WEB VIRTUAL' }
]

const DEFAULT_SORT_BY = 'DIST05'
const DEFAULT_SORT_ORDER: 'asc' | 'desc' = 'asc'

export const FiltrosAvanzados: React.FC<FiltrosAvanzadosProps> = ({
    filtroMotivo,
    setFiltroMotivo,
    filterSegmento,
    setFilterSegmento,
    limpiarFiltros,
    getSegmentoBadge,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetToFirstPage,
    onAplicarFiltros,
    filtroDistrito,        // ✅
    setFiltroDistrito,     // ✅
}) => {
    const [isOpen, setIsOpen] = useState(false)

    const [localMotivo, setLocalMotivo] = useState(filtroMotivo)
    const [localSegmento, setLocalSegmento] = useState(filterSegmento)
    const [localSortBy, setLocalSortBy] = useState(sortBy)
    const [localSortOrder, setLocalSortOrder] = useState<'asc' | 'desc'>(sortOrder)
    const [localDistrito, setLocalDistrito] = useState(filtroDistrito)  // ✅

    useEffect(() => {
        setLocalMotivo(filtroMotivo)
        setLocalSegmento(filterSegmento)
        setLocalSortBy(sortBy)
        setLocalSortOrder(sortOrder)
        setLocalDistrito(filtroDistrito)  // ✅
    }, [filtroMotivo, filterSegmento, sortBy, sortOrder, filtroDistrito, isOpen])

    const filtrosActivos = () => {
        let count = 0
        if (filtroMotivo) count++
        if (filterSegmento !== 'todos') count++
        if (filtroDistrito) count++  // ✅ Contar distrito activo
        return count
    }

    const totalFiltrosActivos = filtrosActivos()

    const handleAplicar = () => {
        setFiltroDistrito(localDistrito)   // ✅
        setFiltroMotivo(localMotivo)
        setFilterSegmento(localSegmento)
        setSortBy(localSortBy)
        setSortOrder(localSortOrder)

        resetToFirstPage()
        onAplicarFiltros?.()
        setIsOpen(false)
    }

    const handleLimpiar = () => {
        setLocalDistrito('')
        setLocalMotivo('')
        setLocalSegmento('todos')
        setLocalSortBy(DEFAULT_SORT_BY)
        setLocalSortOrder(DEFAULT_SORT_ORDER)
        limpiarFiltros()
    }

    return (
        <div className="bg-white dark:bg-orbit-surface2/30 rounded-lg border border-gray-200 dark:border-orbit-border overflow-hidden shadow-sm">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between px-5 py-4 transition-all duration-200",
                    isOpen
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700"
                        : "hover:bg-gray-50 dark:hover:bg-orbit-surface3/50"
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        isOpen
                            ? "bg-green-500 text-white shadow-md shadow-green-500/30"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    )}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </div>

                    <div className="text-left">
                        <div className="flex items-center gap-3">
                            <span className="text-base font-semibold text-gray-800 dark:text-slate-200">
                                Filtros Avanzados
                            </span>
                            {totalFiltrosActivos > 0 && (
                                <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-bold rounded-full bg-green-500 text-white shadow-md shadow-green-500/30">
                                    {totalFiltrosActivos} activos
                                </span>
                            )}
                        </div>
                        {totalFiltrosActivos > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {totalFiltrosActivos} filtro{totalFiltrosActivos > 1 ? 's' : ''} aplicado{totalFiltrosActivos > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                        {isOpen ? 'Cerrar' : 'Abrir'}
                    </span>
                    <svg
                        className={cn(
                            "w-6 h-6 text-gray-400 transition-transform duration-300",
                            isOpen ? "transform rotate-180" : ""
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Contenido */}
            {isOpen && (
                <div className="px-5 pb-5 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Agencia */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Agencia
                            </label>
                            <select
                                value={localDistrito}
                                onChange={(e) => setLocalDistrito(e.target.value)}
                                className="w-full h-10 rounded-lg border border-gray-300 dark:border-orbit-border bg-white dark:bg-orbit-surface2 px-3 text-sm text-gray-900 dark:text-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                            >
                                {AGENCIAS.map((agencia) => (
                                    <option key={agencia.value} value={agencia.value}>
                                        {agencia.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Motivo */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Motivo Retiro
                            </label>
                            <select
                                value={localMotivo}
                                onChange={(e) => setLocalMotivo(e.target.value)}
                                className="w-full h-10 rounded-lg border border-gray-300 dark:border-orbit-border bg-white dark:bg-orbit-surface2 px-3 text-sm text-gray-900 dark:text-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                            >
                                {MOTIVOS_RETIRO.map((motivo) => (
                                    <option key={motivo.value} value={motivo.value}>
                                        {motivo.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Ordenar por */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Ordenar por
                            </label>
                            <select
                                value={localSortBy}
                                onChange={(e) => setLocalSortBy(e.target.value)}
                                className="w-full h-10 rounded-lg border border-gray-300 dark:border-orbit-border bg-white dark:bg-orbit-surface2 px-3 text-sm text-gray-900 dark:text-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                            >
                                <option value="DIST05">Distrito</option>
                                <option value="DESC05">Nombre</option>
                                <option value="BASE05">Salario</option>
                                <option value="NNIT05">Cédula</option>
                                <option value="CIUD05">Ciudad</option>
                                <option value="FRDA05">Fecha de Retiro</option>
                            </select>
                        </div>

                        {/* Orden */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Orden
                            </label>
                            <select
                                value={localSortOrder}
                                onChange={(e) => setLocalSortOrder(e.target.value as 'asc' | 'desc')}
                                className="w-full h-10 rounded-lg border border-gray-300 dark:border-orbit-border bg-white dark:bg-orbit-surface2 px-3 text-sm text-gray-900 dark:text-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                            >
                                <option value="asc">Ascendente (A-Z)</option>
                                <option value="desc">Descendente (Z-A)</option>
                            </select>
                        </div>

                        {/* Segmento */}
                        <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Segmento
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {['todos', 'oro', 'plata', 'bronce'].map((seg) => (
                                    <button
                                        key={seg}
                                        onClick={() => setLocalSegmento(seg as 'todos' | 'oro' | 'plata' | 'bronce')}
                                        className={cn(
                                            'px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize',
                                            localSegmento === seg
                                                ? 'bg-green-600 text-white shadow-md shadow-green-600/30 hover:bg-green-700'
                                                : 'bg-white dark:bg-orbit-surface2 border-2 border-gray-300 dark:border-orbit-border text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-orbit-surface3 hover:border-gray-400 dark:hover:border-gray-500'
                                        )}
                                    >
                                        {seg === 'todos' ? 'Todos' : getSegmentoBadge(seg)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                        <button
                            onClick={handleLimpiar}
                            className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
                        >
                            Limpiar Filtros
                        </button>
                        <button
                            onClick={handleAplicar}
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md shadow-green-600/30 hover:shadow-lg hover:shadow-green-600/40"
                        >
                            Aplicar Filtros
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}