// components/Modals/ModalFase1.tsx

import React from 'react'
import { Modal } from '../../ui/Modals'

interface ModalFase1Props {
    isOpen: boolean
    onClose: () => void
    type?: 'success' | 'error' | 'info' | 'warning'
    title?: string
    message?: string
    data?: {
        nombre?: string
        cuenta?: string
        nomina?: string
        agencia?: string
    }
    onConfirm?: () => void
}

export const ModalFase1: React.FC<ModalFase1Props> = ({
    isOpen,
    onClose,
    type = 'info',
    title = '',
    message = '',
    data,
    onConfirm
}) => {
    if (!isOpen) return null

    const getStyles = () => {
        switch (type) {
            case 'success':
                return {
                    gradient: 'from-green-700 to-emerald-600',
                    badgeText: 'ÉXITO',
                    button: 'bg-green-700 hover:bg-green-800',
                    iconPath: 'M5 13l4 4L19 7',
                }
            case 'error':
                return {
                    gradient: 'from-red-700 to-rose-600',
                    badgeText: 'ATENCIÓN',
                    button: 'bg-red-600 hover:bg-red-700',
                    iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                }
            case 'warning':
                return {
                    gradient: 'from-yellow-600 to-amber-600',
                    badgeText: 'ADVERTENCIA',
                    button: 'bg-yellow-600 hover:bg-yellow-700',
                    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
                }
            default:
                return {
                    gradient: 'from-blue-700 to-sky-600',
                    badgeText: 'INFORMACIÓN',
                    button: 'bg-blue-600 hover:bg-blue-700',
                    iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                }
        }
    }

    const styles = getStyles()

    const handleClose = () => {
        onConfirm?.()
        onClose()
    }

    // Función para renderizar el mensaje con HTML
    const renderMessage = () => {
        if (!message) return null

        // Reemplazar URLs con enlaces clickeables
        const urlRegex = /(https?:\/\/[^\s]+)/g
        const parts = message.split(urlRegex)

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline font-semibold"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                )
            }
            return <span key={index}>{part}</span>
        })
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
            className="border-0 rounded-2xl shadow-2xl overflow-hidden"
        >
            <div className="bg-white dark:bg-gray-900">
                {/* Encabezado visual */}
                <div className={`bg-gradient-to-r ${styles.gradient} px-6 py-5`}>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white/20 flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={styles.iconPath} />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                                {styles.badgeText}
                            </p>
                            <h2 className="text-lg font-bold text-white truncate">
                                {title}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="px-6 py-6">
                    {message && (
                        <p className="text-sm text-gray-700 dark:text-white font-semibold leading-relaxed break-words">
                            {renderMessage()}
                        </p>
                    )}

                    {/* Datos del asociado */}
                    {data && (
                        <div className={`${message ? 'mt-4' : ''} p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700`}>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Información del asociado
                            </p>
                            <div className="space-y-2">
                                {data.nombre && (
                                    <div className="flex justify-between items-start gap-3 text-sm">
                                        <span className="text-gray-800 font-bold dark:text-gray-400 flex-shrink-0">Nombre</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-right break-words min-w-0">{data.nombre}</span>
                                    </div>
                                )}
                                {data.cuenta && (
                                    <div className="flex justify-between items-start gap-3 text-sm">
                                        <span className="text-gray-800 font-bold dark:text-gray-400 flex-shrink-0">N° Cuenta</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-right break-words min-w-0">{data.cuenta}</span>
                                    </div>
                                )}
                                {data.agencia && (
                                    <div className="flex justify-between items-start gap-3 text-sm">
                                        <span className="text-gray-800 font-bold dark:text-gray-400 flex-shrink-0">Agencia</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-right break-words min-w-0">{data.agencia}</span>
                                    </div>
                                )}
                                {data.nomina && (
                                    <div className="flex justify-between items-start gap-3 text-sm">
                                        <span className="text-gray-800 font-bold dark:text-gray-400 flex-shrink-0">Nómina</span>
                                        <span className="font-medium text-gray-900 dark:text-white text-right break-words min-w-0">{data.nomina}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={handleClose}
                        className={`w-full py-2.5 px-4 ${styles.button} text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md`}
                    >
                        {type === 'error' ? 'Entendido' : 'Continuar'}
                    </button>
                </div>
            </div>
        </Modal>
    )
}