import React from 'react'
import { Modal } from '../ui/Modals'

interface ModalConfirmacionProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    message?: string
    data?: {
        nombre?: string
        cuenta?: string
        nomina?: string
        agencia?: string
    }
    onConfirm: () => void
    onCancel: () => void
    confirmText?: string
    cancelText?: string
}

export const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
    isOpen,
    onClose,
    title = 'Cuenta Activa Detectada',
    message = '',
    data,
    onConfirm,
    onCancel,
    confirmText = 'Sí, continuar',
    cancelText = 'No'
}) => {
    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    const handleCancel = () => {
        onCancel()
        onClose()
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
                <div className="bg-gradient-to-r from-yellow-600 to-amber-600 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white/20 flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-yellow-50">
                                Aviso importante
                            </p>
                            <h2 className="text-lg font-bold text-white truncate">
                                {title}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="px-6 py-6">
                    {/* Mensaje informativo principal */}
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300 font-semibold">
                            La cédula ingresada ya se encuentra registrada en la cooperativa con una cuenta activa.
                        </p>
                    </div>

                    {message && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words font-medium">
                            {message}
                        </p>
                    )}

                    {/* Datos del asociado */}
                    {data && (
                        <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <p className="text-md font-semibold text-gray-700 dark:text-gray-400 uppercase tracking-wider mb-2">
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

                    {/* Pregunta principal */}
                    <p className="mt-5 text-sm font-bold text-gray-900 dark:text-white text-center">
                        ¿Deseas continuar con el proceso de vinculación en otra nómina?
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 py-2.5 px-4 text-gray-700 dark:text-gray-300 font-medium bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="flex-1 py-2.5 px-4 text-white font-medium bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800 rounded-lg transition-colors shadow-sm hover:shadow-md"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    )
}