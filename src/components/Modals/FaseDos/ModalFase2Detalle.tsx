import React from 'react';
import { Modal } from '../../ui/Modals/index';
import { cn } from '@/utils/cn';
import { formatNumberWithDots } from '@/utils/helpsVincu';

interface ModalFase2DetalleProps {
    isOpen: boolean;
    onClose: () => void;
    solicitud: any | null;
}

export const ModalFase2Detalle: React.FC<ModalFase2DetalleProps> = ({
    isOpen,
    onClose,
    solicitud
}) => {
    if (!isOpen || !solicitud) return null;

    const InfoCard = ({ label, value, bgColor = 'bg-gray-50 dark:bg-gray-800/30' }: any) => (
        <div className={cn(
            'flex flex-col p-3 rounded-lg border border-gray-100 dark:border-orbit-border transition-all hover:shadow-sm',
            bgColor
        )}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {label}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {value || 'N/A'}
            </p>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            className="border-0 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
        >
            <div className="bg-white dark:bg-gray-900">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Detalle Fase 2
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {solicitud.nombres} {solicitud.apellidos} - Cédula: {formatNumberWithDots(solicitud.numero_documento)}
                            </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300">
                            En trámite
                        </span>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                    {/* Información del asociado */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <InfoCard label="Nombre" value={`${solicitud.nombres} ${solicitud.apellidos}`} bgColor="bg-blue-50 dark:bg-blue-900/20" />
                        <InfoCard label="Cédula" value={formatNumberWithDots(solicitud.numero_documento)} bgColor="bg-blue-50 dark:bg-blue-900/20" />
                        <InfoCard label="Correo" value={solicitud.correo_electronico} bgColor="bg-blue-50 dark:bg-blue-900/20" />
                        <InfoCard label="Score" value={solicitud.score} bgColor="bg-blue-50 dark:bg-blue-900/20" />
                    </div>

                    {/* Referencias Familiares */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                Referencias Familiares
                            </h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <InfoCard label="Nombre" value={solicitud.familiar1_nombre} />
                            <InfoCard label="Parentesco" value={solicitud.familiar1_parentesco} />
                            <InfoCard label="Teléfono" value={solicitud.familiar1_telefono} />
                            <InfoCard label="Nombre" value={solicitud.familiar2_nombre} />
                            <InfoCard label="Parentesco" value={solicitud.familiar2_parentesco} />
                            <InfoCard label="Teléfono" value={solicitud.familiar2_telefono} />
                        </div>
                    </div>

                    {/* Referencias Personales */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                Referencias Personales
                            </h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <InfoCard label="Nombre" value={solicitud.personal1_nombre} />
                            <InfoCard label="Teléfono" value={solicitud.personal1_telefono} />
                            <InfoCard label="Dirección" value={solicitud.personal1_direccion} />
                            <InfoCard label="Nombre" value={solicitud.personal2_nombre} />
                            <InfoCard label="Teléfono" value={solicitud.personal2_telefono} />
                            <InfoCard label="Dirección" value={solicitud.personal2_direccion} />
                        </div>
                    </div>

                    {/* Información del Cónyuge */}
                    {(solicitud.conyuge_nombre || solicitud.conyuge_cedula || solicitud.conyuge_telefono) && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    Información del Cónyuge
                                </h3>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <InfoCard label="Nombre" value={solicitud.conyuge_nombre} />
                                <InfoCard label="Cédula" value={formatNumberWithDots(solicitud.conyuge_cedula)} />
                                <InfoCard label="Teléfono" value={solicitud.conyuge_telefono} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm hover:shadow-md"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};