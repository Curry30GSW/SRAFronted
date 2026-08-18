import React from 'react'
import { Modal } from '../ui/Modals'

interface ModalSolicitudEnviadaProps {
    isOpen: boolean
    onClose: () => void
}

export const ModalSolicitudEnviada: React.FC<ModalSolicitudEnviadaProps> = ({
    isOpen,
    onClose
}) => {

    if (!isOpen) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
            className="border-0 rounded-2xl shadow-2xl overflow-hidden"
        >
            <div className="bg-white">

                {/* Encabezado visual */}
                <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white/20">
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
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-white">
                                ¡Solicitud recibida!
                            </h2>

                            <p className="text-sm text-green-50 mt-0.5">
                                Su información fue enviada correctamente
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contenido */}
                <div className="px-6 py-7">

                    <div className="flex justify-center mb-5">
                        <div className="w-20 h-20 rounded-full bg-green-50 border-8 border-green-100 flex items-center justify-center">
                            <svg
                                className="w-10 h-10 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Hemos recibido su solicitud de asociación
                        </h3>

                        <p className="mt-3 text-sm leading-6 text-gray-600">
                            Gracias por su interés en hacer parte de{' '}
                            <span className="font-semibold text-green-700">
                                COOPSERP
                            </span>.
                        </p>
                    </div>

                    {/* Información importante */}
                    <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="flex items-start gap-3">

                            <div className="flex-shrink-0 mt-0.5">
                                <svg
                                    className="w-5 h-5 text-green-700"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 16h-1v-4h-1m1-4h.01M12 21a9 9 0 100-18 9 9 0 000 18z"
                                    />
                                </svg>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-gray-800">
                                    ¿Qué sigue ahora?
                                </p>

                                <p className="text-sm text-gray-800 leading-5 mt-1">
                                    Nuestro equipo de COOPSERP validará la información
                                    suministrada en el formulario.
                                </p>

                                <p className="text-sm text-gray-800 leading-5 mt-2">
                                    Una vez finalizada la validación, nos
                                    pondremos en contacto con usted para
                                    continuar con el proceso de solicitud de
                                    asociación.
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Nota */}
                    <p className="text-xs text-center text-gray-700 mt-5">
                        Por favor, esté atento a los medios de contacto
                        registrados en el formulario.
                    </p>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full px-5 py-2.5 text-sm font-semibold text-white bg-green-700 hover:bg-green-800 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                        Entendido
                    </button>
                </div>

            </div>
        </Modal>
    )
}