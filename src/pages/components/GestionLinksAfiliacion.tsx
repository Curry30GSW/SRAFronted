import React, { useState, useEffect } from 'react'
import { FetchDynamic } from '../../components/Api/FetchDynamic'
import Swal from 'sweetalert2'
import { Link2, Copy, RefreshCw, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface GestionLinksAfiliacionProps {
    usuarioId: number
    usuarioNombre: string
}

interface LinkAfiliacion {
    id_link: number
    codigo: string
    id_usuario: number
    usuario: string
    fecha_creacion: string
    fecha_expiracion: string | null
    activo: number
    uso_maximo: number
    usos_actuales: number
}

interface VinculacionStats {
    total: number
    pendientes: number
    aprobados: number
    rechazados: number
    en_revision: number
}

interface VinculacionItem {
    id_solicitante: number
    nombres: string
    apellidos: string
    numero_documento: string
    correo_electronico: string
    estado: string
    fecha_creacion: string
    codigo_link: string | null
}

export const GestionLinksAfiliacion: React.FC<GestionLinksAfiliacionProps> = ({
    usuarioId,
    usuarioNombre
}) => {
    const [loading, setLoading] = useState(false)
    const [generando, setGenerando] = useState(false)
    const [links, setLinks] = useState<LinkAfiliacion[]>([])

    // ✅ Paginación para links
    const [linksCurrentPage, setLinksCurrentPage] = useState(1)
    const [linksTotalPages, setLinksTotalPages] = useState(1)
    const linksPerPage = 5

    const [estadisticas, setEstadisticas] = useState<VinculacionStats>({
        total: 0,
        pendientes: 0,
        aprobados: 0,
        rechazados: 0,
        en_revision: 0
    })
    const [vinculaciones, setVinculaciones] = useState<VinculacionItem[]>([])
    const [mostrandoVinculaciones, setMostrandoVinculaciones] = useState(false)
    const [filtroEstado, setFiltroEstado] = useState<string>('todos')
    const [loadingVinculaciones, setLoadingVinculaciones] = useState(false)

    // ✅ Paginación para vinculaciones
    const [vinculacionesCurrentPage, setVinculacionesCurrentPage] = useState(1)
    const [vinculacionesTotalPages, setVinculacionesTotalPages] = useState(1)
    const vinculacionesPerPage = 5

    const basePath = import.meta.env.BASE_URL?.replace(/\/$/, '') || ''

    useEffect(() => {
        if (usuarioId) {
            cargarLinks()
            cargarEstadisticas()
        }
    }, [usuarioId])

    const cargarLinks = async () => {
        try {
            setLoading(true)
            const response = await FetchDynamic(`/links/usuario/${usuarioId}`)
            const result = await response.json()
            if (result.success) {
                setLinks(result.data || [])
                setLinksTotalPages(Math.ceil((result.data || []).length / linksPerPage))
            }
        } catch (error) {
            console.error('Error cargando links:', error)
        } finally {
            setLoading(false)
        }
    }

    const cargarEstadisticas = async () => {
        try {
            const response = await FetchDynamic(`/vinculacion/usuario/${usuarioId}`)
            const result = await response.json()
            if (result.success) {
                setEstadisticas(result.estadisticas || {
                    total: 0,
                    pendientes: 0,
                    aprobados: 0,
                    rechazados: 0,
                    en_revision: 0
                })
                setVinculaciones(result.data || [])
                setVinculacionesTotalPages(Math.ceil((result.data || []).length / vinculacionesPerPage))
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error)
        }
    }

    const generarLink = async () => {
        try {
            setGenerando(true)

            const response = await FetchDynamic('/links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: usuarioId,
                    usuario: usuarioNombre,
                    uso_maximo: 0,
                    dias_expiracion: 30
                })
            })

            const result = await response.json()

            if (result.success) {
                const urlCompleta = `${window.location.origin}${basePath}/afiliacion/${result.data.codigo}`

                await navigator.clipboard.writeText(urlCompleta)

                Swal.fire({
                    icon: 'success',
                    title: 'Link generado y copiado',
                    html: `
                        <p class="text-sm">El link se ha copiado al portapapeles</p>
                        <p class="text-xs text-gray-500 mt-2 break-all">${urlCompleta}</p>
                    `,
                    timer: 3000,
                    showConfirmButton: false
                })

                cargarLinks()
            } else {
                throw new Error(result.message || 'Error al generar el link')
            }
        } catch (error) {
            console.error('Error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar el link'
            })
        } finally {
            setGenerando(false)
        }
    }

    const copiarLink = async (codigo: string) => {
        const urlCompleta = `${window.location.origin}${basePath}/afiliacion/${codigo}`
        await navigator.clipboard.writeText(urlCompleta)
        Swal.fire({
            icon: 'success',
            title: 'Link copiado',
            timer: 1500,
            showConfirmButton: false
        })
    }

    const toggleVinculaciones = () => {
        setMostrandoVinculaciones(!mostrandoVinculaciones)
        if (!mostrandoVinculaciones) {
            cargarVinculaciones()
        }
    }

    const cargarVinculaciones = async () => {
        try {
            setLoadingVinculaciones(true)
            const response = await FetchDynamic(`/vinculacion/usuario/${usuarioId}`)
            const result = await response.json()
            if (result.success) {
                setVinculaciones(result.data || [])
                setVinculacionesTotalPages(Math.ceil((result.data || []).length / vinculacionesPerPage))
            }
        } catch (error) {
            console.error('Error cargando vinculaciones:', error)
        } finally {
            setLoadingVinculaciones(false)
        }
    }

    const getEstadoBadge = (estado: string) => {
        const configs = {
            'PENDIENTE': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', label: 'Pendiente' },
            'EN_REVISION': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', label: 'En Revisión' },
            'APROBADO': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Aprobado' },
            'RECHAZADO': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Rechazado' },
        }
        return configs[estado as keyof typeof configs] || configs['PENDIENTE']
    }

    const formatearFecha = (fecha: string) => {
        try {
            return new Date(fecha).toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return fecha
        }
    }

    // ✅ Obtener links paginados
    const getPaginatedLinks = () => {
        const startIndex = (linksCurrentPage - 1) * linksPerPage
        const endIndex = startIndex + linksPerPage
        return links.slice(startIndex, endIndex)
    }

    // ✅ Obtener vinculaciones paginadas y filtradas
    const getPaginatedVinculaciones = () => {
        const filtradas = vinculaciones.filter(v => {
            if (filtroEstado === 'todos') return true
            return v.estado === filtroEstado
        })

        const startIndex = (vinculacionesCurrentPage - 1) * vinculacionesPerPage
        const endIndex = startIndex + vinculacionesPerPage
        return filtradas.slice(startIndex, endIndex)
    }

    const vinculosFiltrados = vinculaciones.filter(v => {
        if (filtroEstado === 'todos') return true
        return v.estado === filtroEstado
    })

    const vinculosPaginados = getPaginatedVinculaciones()

    // ✅ Componente de paginación
    const PaginationControls = ({
        currentPage,
        totalPages,
        onPageChange,
        totalItems,
        itemsPerPage
    }: {
        currentPage: number,
        totalPages: number,
        onPageChange: (page: number) => void,
        totalItems: number,
        itemsPerPage: number
    }) => {
        if (totalPages <= 1) return null

        return (
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                    Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-gray-500" />
                    </button>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 px-2">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
            {/* Header - Fijo */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Gestión de Links de Afiliación
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Genera links y monitorea tus afiliaciones
                        </p>
                    </div>
                    <button
                        onClick={cargarLinks}
                        disabled={loading}
                        className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <RefreshCw className={cn(
                            "w-4 h-4 text-gray-500",
                            loading && "animate-spin"
                        )} />
                    </button>
                </div>
            </div>

            {/* Contenido - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Estadísticas - Grid completo */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                    <div className="bg-white dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center hover:shadow-md transition-shadow">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.total}</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700 p-4 text-center hover:shadow-md transition-shadow">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">Pendientes</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{estadisticas.pendientes}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-4 text-center hover:shadow-md transition-shadow">
                        <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">En Revisión</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{estadisticas.en_revision}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 p-4 text-center hover:shadow-md transition-shadow">
                        <p className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider">Aprobados</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{estadisticas.aprobados}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700 p-4 text-center hover:shadow-md transition-shadow">
                        <p className="text-xs text-red-600 dark:text-red-400 uppercase tracking-wider">Rechazados</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{estadisticas.rechazados}</p>
                    </div>
                </div>

                {/* Generar Link */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/20 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Generar nuevo link de afiliación
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                El link se copiará automáticamente al portapapeles
                            </p>
                        </div>
                        <button
                            onClick={generarLink}
                            disabled={generando}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md whitespace-nowrap"
                        >
                            <Link2 className="w-4 h-4" />
                            {generando ? 'Generando...' : 'Generar Link'}
                        </button>
                    </div>
                </div>

                {/* Lista de Links con paginación */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Mis Links Generados
                        </h4>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                            {links.length} links
                        </span>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : links.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/20 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                No has generado ningún link aún
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-2">
                                {getPaginatedLinks().map((link) => (
                                    <div
                                        key={link.id_link}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate">
                                                    {link.codigo}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    Usos: {link.usos_actuales}
                                                </span>
                                                <span className={`text-xs font-medium ${link.activo ? 'text-green-500' : 'text-red-500'}`}>
                                                    {link.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    {formatearFecha(link.fecha_creacion)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => copiarLink(link.codigo)}
                                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors ml-2 flex-shrink-0"
                                            title="Copiar link"
                                        >
                                            <Copy className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <PaginationControls
                                currentPage={linksCurrentPage}
                                totalPages={linksTotalPages}
                                onPageChange={setLinksCurrentPage}
                                totalItems={links.length}
                                itemsPerPage={linksPerPage}
                            />
                        </>
                    )}
                </div>

                {/* Vinculaciones con paginación */}
                <div>
                    <button
                        onClick={toggleVinculaciones}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mb-4"
                    >
                        <Users className="w-4 h-4" />
                        {mostrandoVinculaciones ? 'Ocultar vinculaciones' : 'Ver vinculaciones realizadas'}
                        <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                            {estadisticas.total}
                        </span>
                    </button>

                    {mostrandoVinculaciones && (
                        <div>
                            {/* Filtros */}
                            <div className="flex gap-2 mb-3 flex-wrap">
                                <button
                                    onClick={() => {
                                        setFiltroEstado('todos')
                                        setVinculacionesCurrentPage(1)
                                    }}
                                    className={cn(
                                        'px-3 py-1 text-xs rounded-full transition-colors',
                                        filtroEstado === 'todos'
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    )}
                                >
                                    Todos
                                </button>
                                {['PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO'].map((estado) => {
                                    const badge = getEstadoBadge(estado)
                                    return (
                                        <button
                                            key={estado}
                                            onClick={() => {
                                                setFiltroEstado(estado)
                                                setVinculacionesCurrentPage(1)
                                            }}
                                            className={cn(
                                                'px-3 py-1 text-xs rounded-full transition-colors',
                                                filtroEstado === estado
                                                    ? badge.color
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            )}
                                        >
                                            {badge.label}
                                        </button>
                                    )
                                })}
                            </div>

                            {loadingVinculaciones ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : vinculosFiltrados.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/20 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-400 dark:text-gray-500">
                                        No hay vinculaciones con este estado
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 gap-2">
                                        {vinculosPaginados.map((v) => {
                                            const badge = getEstadoBadge(v.estado)
                                            return (
                                                <div
                                                    key={v.id_solicitante}
                                                    className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                {v.nombres} {v.apellidos}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                                                <span>CC: {v.numero_documento}</span>
                                                                <span>{v.correo_electronico}</span>
                                                                <span>{formatearFecha(v.fecha_creacion)}</span>
                                                            </div>
                                                        </div>
                                                        <span className={cn(
                                                            'px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0',
                                                            badge.color
                                                        )}>
                                                            {badge.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <PaginationControls
                                        currentPage={vinculacionesCurrentPage}
                                        totalPages={vinculacionesTotalPages}
                                        onPageChange={setVinculacionesCurrentPage}
                                        totalItems={vinculosFiltrados.length}
                                        itemsPerPage={vinculacionesPerPage}
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}