import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modals/index';
import { FetchDynamic } from '../Api/FetchDynamic';
import { Vinculacion } from '../../types/Vinculacion';
import {
    formatFecha,
    formatFechaHora,
    getTipoTrabajadorLabel,
    getSectorEmpresaLabel,
    parseTelefonos,
    getEstadoBadge
} from '../../utils/helpsVincu';

import { cn } from '../../utils/cn';

interface ModalVerDetalleVinculacionProps {
    isOpen: boolean;
    onClose: () => void;
    idSolicitante: number | null;
}

export const ModalVerDetalleVinculacion: React.FC<ModalVerDetalleVinculacionProps> = ({
    isOpen,
    onClose,
    idSolicitante
}) => {
    const [vinculacion, setVinculacion] = useState<Vinculacion | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && idSolicitante) {
            fetchDetalle();
        }
        if (!isOpen) {
            setVinculacion(null);
            setError(null);
        }
    }, [isOpen, idSolicitante]);

    const fetchDetalle = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await FetchDynamic(`/vinculacion/${idSolicitante}`);
            if (!response.ok) throw new Error('Error al cargar los detalles');
            const result = await response.json();
            setVinculacion(result.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    // Badge de estado
    const StatusBadge = ({ estado }: { estado: string }) => {
        const config = {
            'PENDIENTE': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pendiente' },
            'APROBADO': { color: 'bg-green-100 text-green-800 border-green-300', label: 'Aprobado' },
            'RECHAZADO': { color: 'bg-red-100 text-red-800 border-red-300', label: 'Rechazado' },
            'EN_REVISION': { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'En Revisión' },
        };
        const status = config[estado as keyof typeof config] || config['PENDIENTE'];

        return (
            <span className={cn(
                'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border',
                status.color
            )}>
                {status.label}
            </span>
        );
    };

    // Info Card
    const InfoCard = ({
        label,
        value,
        bgColor = 'bg-gray-50 dark:bg-gray-800/30'
    }: {
        label: string;
        value: string | number | null | undefined;
        bgColor?: string;
    }) => (
        <div className={cn(
            'flex flex-col p-3 rounded-lg border border-gray-100 dark:border-orbit-border transition-all hover:shadow-sm',
            bgColor
        )}>
            <p className="text-sm font-medium text-gray-800 dark:text-slate-400 uppercase tracking-wider">
                {label}
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 mt-1 truncate">
                {value || 'N/A'}
            </p>
        </div>
    );

    // Sección
    const renderSection = (title: string, children: React.ReactNode) => (
        <div className="bg-white dark:bg-orbit-surface2/20 rounded-xl border border-gray-100 dark:border-orbit-border overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-orbit-surface2/50 border-b border-gray-100 dark:border-orbit-border">
                <h3 className="text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                    {title}
                </h3>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {children}
                </div>
            </div>
        </div>
    );



    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            size="xl"
        >
            {error && (
                <div className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <button
                        onClick={fetchDetalle}
                        className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {vinculacion && !loading && (
                <div className="space-y-6">
                    {/* ===== HEADER ===== */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 dark:from-purple-800 dark:to-purple-900 p-6 text-white">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                                    {vinculacion.nombres?.charAt(0) || '?'}
                                    {vinculacion.apellidos?.charAt(0) || ''}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {vinculacion.nombres} {vinculacion.apellidos}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <span className="text-sm text-white">
                                            {vinculacion.tipo_documento}: {vinculacion.numero_documento}
                                        </span>
                                        <span className="text-sm text-white">
                                            {formatFecha(vinculacion.fecha_nacimiento)}
                                        </span>
                                    </div>
                                </div>
                            </div>


                            <div className="flex flex-col items-end gap-2">
                                <span className="text-xl font-bold text-red-500 bg-red-200 px-3 py-1.5 rounded-full border border-red-400">
                                    F1 No. {vinculacion.id_solicitante}
                                </span>
                                <span className="text-sm font-semibold text-white/90">
                                    Fecha Solicitud: {formatFechaHora(vinculacion.fecha_creacion)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ===== INFORMACIÓN LABORAL ===== */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <InfoCard
                            label="Tipo de Trabajador"
                            value={getTipoTrabajadorLabel(vinculacion.tipo_trabajador)}
                            bgColor="bg-amber-50 dark:bg-amber-900/20"
                        />
                        {vinculacion.tipo_trabajador === 'EMPLEADO' && (
                            <>
                                <InfoCard
                                    label="Empresa"
                                    value={vinculacion.empresa}
                                    bgColor="bg-amber-50 dark:bg-amber-900/20"
                                />
                                <InfoCard
                                    label="Cargo"
                                    value={vinculacion.cargo}
                                    bgColor="bg-amber-50 dark:bg-amber-900/20"
                                />
                                <InfoCard
                                    label="Sector"
                                    value={vinculacion.sector_empresa}
                                    bgColor="bg-amber-50 dark:bg-amber-900/20"
                                />
                            </>
                        )}
                        {vinculacion.tipo_trabajador === 'PENSIONADO' && (
                            <InfoCard
                                label="Pagaduría"
                                value={vinculacion.pagaduria}
                                bgColor="bg-amber-50 dark:bg-amber-900/20"
                            />
                        )}
                    </div>

                    {/* ===== DOCUMENTO DE IDENTIFICACIÓN ===== */}
                    {renderSection('Documento de Identificación',
                        <>
                            <InfoCard label="Tipo Documento" value={vinculacion.tipo_documento} bgColor="bg-blue-50 dark:bg-blue-900/20" />
                            <InfoCard label="Número Documento" value={vinculacion.numero_documento} bgColor="bg-blue-50 dark:bg-blue-900/20" />
                            <InfoCard label="Lugar de Expedición" value={vinculacion.lugar_expedicion} bgColor="bg-blue-50 dark:bg-blue-900/20" />
                            <InfoCard label="Fecha de Expedición" value={formatFecha(vinculacion.fecha_expedicion)} bgColor="bg-blue-50 dark:bg-blue-900/20" />
                        </>
                    )}

                    {/* ===== DATOS PERSONALES ===== */}
                    {renderSection('Datos Personales',
                        <>
                            <InfoCard label="Nombres" value={vinculacion.nombres} bgColor="bg-pink-50 dark:bg-pink-900/20" />
                            <InfoCard label="Apellidos" value={vinculacion.apellidos} bgColor="bg-pink-50 dark:bg-pink-900/20" />
                            <InfoCard label="Fecha de Nacimiento" value={formatFecha(vinculacion.fecha_nacimiento)} bgColor="bg-pink-50 dark:bg-pink-900/20" />
                            <InfoCard label="Lugar de Nacimiento" value={vinculacion.lugar_nacimiento} bgColor="bg-pink-50 dark:bg-pink-900/20" />
                            <InfoCard label="Ciudad de Residencia" value={vinculacion.ciudad_residencia} bgColor="bg-pink-50 dark:bg-pink-900/20" />
                            <InfoCard label="Dirección de Residencia" value={vinculacion.direccion_residencia} bgColor="bg-pink-50 dark:bg-pink-900/20" />
                        </>
                    )}

                    {/* ===== CONTACTO ===== */}
                    {renderSection('Información de Contacto',
                        <>
                            <InfoCard label="Dirección Correspondencia" value={vinculacion.direccion_correspondencia} bgColor="bg-green-50 dark:bg-green-900/20" />
                            <InfoCard label="Ciudad Correspondencia" value={vinculacion.ciudad_correspondencia} bgColor="bg-green-50 dark:bg-green-900/20" />
                            <InfoCard label="Teléfonos" value={parseTelefonos(vinculacion.telefonos).join(', ') || 'No registra'} bgColor="bg-green-50 dark:bg-green-900/20" />
                            <InfoCard label="WhatsApp" value={vinculacion.whatsapp} bgColor="bg-green-50 dark:bg-green-900/20" />
                            <InfoCard label="Correo Electrónico" value={vinculacion.correo_electronico} bgColor="bg-green-50 dark:bg-green-900/20" />
                        </>
                    )}

                    {/* ===== AUTORIZACIONES ===== */}
                    <div className="bg-white dark:bg-orbit-surface2/20 rounded-xl border border-gray-100 dark:border-orbit-border overflow-hidden">
                        <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b border-gray-100 dark:border-orbit-border">
                            <h3 className="text-md font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
                                Autorizaciones
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className={cn(
                                    'flex flex-col p-3 rounded-lg border-2 transition-all',
                                    vinculacion.central_riesgos
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600/50'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600/50'
                                )}>
                                    <p className="text-sm font-bold text-gray-800 dark:text-slate-300 uppercase">
                                        Centrales de Riesgo
                                    </p>
                                    <p className={cn(
                                        'text-sm font-semibold mt-1',
                                        vinculacion.central_riesgos ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    )}>
                                        {vinculacion.central_riesgos ? 'Autorizado' : 'No autorizado'}
                                    </p>
                                </div>
                                <div className={cn(
                                    'flex flex-col p-3 rounded-lg border-2 transition-all',
                                    vinculacion.tratamiento_datos
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600/50'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600/50'
                                )}>
                                    <p className="text-sm font-bold text-gray-800 dark:text-slate-300 uppercase">
                                        Tratamiento de Datos
                                    </p>
                                    <p className={cn(
                                        'text-sm font-semibold mt-1',
                                        vinculacion.tratamiento_datos ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    )}>
                                        {vinculacion.tratamiento_datos ? 'Aceptado' : 'No aceptado'}
                                    </p>
                                </div>
                                <div className={cn(
                                    'flex flex-col p-3 rounded-lg border-2 transition-all',
                                    vinculacion.apertura_coopserp
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600/50'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600/50'
                                )}>
                                    <p className="text-sm font-bold text-gray-800 dark:text-slate-300 uppercase">
                                        Apertura de Cuenta
                                    </p>
                                    <p className={cn(
                                        'text-sm font-semibold mt-1',
                                        vinculacion.apertura_coopserp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    )}>
                                        {vinculacion.apertura_coopserp ? 'Autorizado' : 'No autorizado'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};