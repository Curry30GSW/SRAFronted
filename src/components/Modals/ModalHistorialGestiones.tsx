import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modals/index'
import { FetchDynamic } from '../Api/FetchDynamic'
import { cn } from '@/utils/cn'

interface ModalHistorialGestionesProps {
    isOpen: boolean
    onClose: () => void
    cedula: string
    nombre: string
}

interface Gestion {
    id_gestion: number
    cedula: string
    nombre: string
    cuenta: string
    gestion: string
    fecha_gestion: string
    usuario_gestion: string
}

export const ModalHistorialGestiones: React.FC<ModalHistorialGestionesProps> = ({
    isOpen,
    onClose,
    cedula,
    nombre
}) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [gestiones, setGestiones] = useState<Gestion[]>([])

    useEffect(() => {
        if (isOpen && cedula) {
            fetchGestiones()
        }
    }, [isOpen, cedula])

    const fetchGestiones = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await FetchDynamic(`/api/gestion/cedula/${cedula}`)
            if (!response.ok) throw new Error('Error al cargar las gestiones')

            const result = await response.json()

            if (result.success) {
                setGestiones(result.data || [])
            } else {
                setError('No se encontraron gestiones')
            }
        } catch (err) {
            console.error('Error:', err)
            setError('Error al cargar el historial de gestiones')
        } finally {
            setLoading(false)
        }
    }

    const formatFechaGestion = (fecha: string) => {
        if (!fecha) return 'Fecha no disponible'
        try {
            const date = new Date(fecha)
            return date.toLocaleDateString('es-CO', {
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

    if (!isOpen) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            className="max-h-[90vh] overflow-hidden border-0 rounded-2xl shadow-2xl"
        >
            {/* Header */}
            <div className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Historial de Gestiones
                        </h2>
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                            {nombre} • Cédula: {cedula}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full font-medium">
                            {gestiones.length} registros
                        </span>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800/30 max-h-[70vh]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 dark:text-red-400">{error}</p>
                    </div>
                ) : gestiones.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 dark:text-gray-400">No hay gestiones registradas</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {gestiones.map((gestion, index) => {
                            const isLast = index === gestiones.length - 1
                            const isFirst = index === 0
                            const numero = index + 1

                            return (
                                <div key={gestion.id_gestion} className="relative">
                                    {/* Línea de tiempo */}
                                    {!isLast && (
                                        <div className="absolute left-[21px] top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                                    )}

                                    {/* Círculo numerado */}
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                                            isFirst
                                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                        )}>
                                            {numero}
                                        </div>

                                        {/* Tarjeta de gestión */}
                                        <div className="flex-1 min-w-0">
                                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                                                {/* Header de la tarjeta */}
                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                            Cuenta: <span className="text-blue-600 dark:text-blue-400 font-semibold">{gestion.cuenta}</span>
                                                        </span>
                                                        {isFirst && (
                                                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium px-2 py-0.5 rounded">
                                                                Última
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs font-medium text-gray-800 dark:text-gray-200">
                                                        <span>
                                                            {formatFechaGestion(gestion.fecha_gestion)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            {gestion.usuario_gestion || 'SISTEMA'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Contenido */}
                                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                                                    {gestion.gestion}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        Total: {gestiones.length} registro{gestiones.length !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </Modal>
    )
}