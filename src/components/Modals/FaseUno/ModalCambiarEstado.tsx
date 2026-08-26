import React, { useState, useEffect } from 'react';
import { Modal } from '../../ui/Modals/index';
import { FetchDynamic } from '../../Api/FetchDynamic';
import { cn } from '@/utils/cn';
import Swal from 'sweetalert2';
import { getEstadoLabel } from '@/utils/helpsVincu';

interface ModalCambiarEstadoProps {
    isOpen: boolean;
    onClose: () => void;
    solicitud: {
        id_solicitante: number;
        numero_documento: string;
        nombres: string;
        apellidos: string;
        estado: string;
    } | null;
    onSuccess?: () => void;
}

interface ScoreInfo {
    score: number;
    fecha_score: string;
    tiene_score: boolean;
}

// SVG Icons
const ICONS = {
    DESISTIMIENTO: (
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    CAPACIDAD_PAGO_NEGATIVA: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0-1c-1.11 0-2.08.402-2.599 1M12 8V7M9 12v1m3-2v3m-3 0v1m3 0v1" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    SCORE_BAJO: (
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    EMBARGO: (
        <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    ),
    EMPRESA_PRIVADA: (
        <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    PENDIENTE_DATACREDITO: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    EN_TRAMITE: (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    ),
};

const OPCIONES_ESTADO = [
    {
        value: 'PENDIENTE_DATACREDITO',
        label: 'Pendiente consulta Datacrédito',
        description: 'Se ha solicitado la consulta en Datacrédito. Se está a la espera de la respuesta.',
        icon: ICONS.PENDIENTE_DATACREDITO,
        color: 'text-blue-500',
        requiereObservaciones: false,
        estadosOrigen: ['PENDIENTE', 'EN_REVISION']
    },
    {
        value: 'EN_TRAMITE',
        label: 'En trámite - Fase 2',
        description: 'El asociado ha pasado a Fase 2. Se procederá con la verificación de capacidad de descuento y referencias.',
        icon: ICONS.EN_TRAMITE,
        color: 'text-green-500',
        requiereObservaciones: false,
        esFase2: true,
        estadosOrigen: ['PENDIENTE_DATACREDITO', 'PENDIENTE', 'EN_REVISION']
    },
    {
        value: 'DESISTIMIENTO',
        label: 'Desistimiento',
        description: 'El solicitante ha decidido no continuar con el proceso de vinculación.',
        icon: ICONS.DESISTIMIENTO,
        color: 'text-gray-600',
        requiereObservaciones: true,
        estadosOrigen: ['PENDIENTE', 'EN_REVISION', 'PENDIENTE_DATACREDITO', 'EN_TRAMITE']
    },
    {
        value: 'CAPACIDAD_PAGO_NEGATIVA',
        label: 'Capacidad de pago negativa',
        description: 'El análisis de capacidad de pago determina que el solicitante no tiene la capacidad de descuento suficiente para asociarse a COOPSERP.',
        icon: ICONS.CAPACIDAD_PAGO_NEGATIVA,
        color: 'text-red-500',
        requiereObservaciones: true,
        estadosOrigen: ['PENDIENTE', 'EN_REVISION', 'PENDIENTE_DATACREDITO']
    },
    {
        value: 'SCORE_BAJO',
        label: 'Score bajo',
        description: 'El score en centrales de riesgo es inferior a 650 puntos, lo que indica un alto riesgo crediticio.',
        icon: ICONS.SCORE_BAJO,
        color: 'text-purple-500',
        requiereObservaciones: true,
        estadosOrigen: ['PENDIENTE_DATACREDITO', 'PENDIENTE', 'EN_REVISION']
    },
    {
        value: 'EMBARGO',
        label: 'Embargo',
        description: 'El solicitante tiene un embargo vigente que impide la vinculación.',
        icon: ICONS.EMBARGO,
        color: 'text-rose-500',
        requiereObservaciones: true,
        estadosOrigen: ['PENDIENTE', 'EN_REVISION', 'PENDIENTE_DATACREDITO']
    },
    {
        value: 'EMPRESA_PRIVADA',
        label: 'Empresa privada',
        description: 'COOPSERP está enfocado al sector público y pensionados. No se aceptan vinculaciones de empresa privada.',
        icon: ICONS.EMPRESA_PRIVADA,
        color: 'text-indigo-500',
        requiereObservaciones: true,
        estadosOrigen: ['PENDIENTE', 'EN_REVISION', 'PENDIENTE_DATACREDITO']
    },
];

export const ModalCambiarEstado: React.FC<ModalCambiarEstadoProps> = ({
    isOpen,
    onClose,
    solicitud,
    onSuccess
}) => {
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('');
    const [observaciones, setObservaciones] = useState('');
    const [loading, setLoading] = useState(false);
    const [scoreInfo, setScoreInfo] = useState<ScoreInfo | null | undefined>(null);
    const [cargandoScore, setCargandoScore] = useState(false);

    useEffect(() => {
        if (isOpen && solicitud) {
            setEstadoSeleccionado('');
            setObservaciones('');
            setScoreInfo(null);
            consultarScore();
        }
    }, [isOpen, solicitud]);

    const consultarScore = async () => {
        if (!solicitud) return;

        try {
            setCargandoScore(true);
            const response = await FetchDynamic(`/score/${solicitud.numero_documento}`);
            const result = await response.json();

            if (result.success && result.data) {
                setScoreInfo({
                    score: result.data.score,
                    fecha_score: result.data.fec_score,
                    tiene_score: true
                });
            } else {
                setScoreInfo({
                    score: 0,
                    fecha_score: '',
                    tiene_score: false
                });
            }
        } catch (error) {
            console.error('Error consultando score:', error);
            setScoreInfo({
                score: 0,
                fecha_score: '',
                tiene_score: false
            });
        } finally {
            setCargandoScore(false);
        }
    };

    const handleCambiarEstado = async () => {
        if (!estadoSeleccionado) {
            Swal.fire({
                icon: 'warning',
                title: 'Seleccione un estado',
                text: 'Debe seleccionar un estado para continuar.'
            });
            return;
        }

        // ✅ Validar si es EN_TRAMITE (Fase 2) 
        if (estadoSeleccionado === 'EN_TRAMITE') {
            if (!scoreInfo?.tiene_score || scoreInfo.score === null || scoreInfo.score === undefined) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Score no disponible',
                    text: 'No se ha realizado la consulta de score en centrales de riesgo para este asociado. Primero debe consultar el score en Datacrédito.'
                });
                return;
            }
            // Si tiene score pero es menor a 650, mostrar advertencia pero permitir pasar
            if (scoreInfo.score < 650) {
                const confirm = await Swal.fire({
                    icon: 'warning',
                    title: 'Score inferior a 650',
                    text: `El score del asociado es ${scoreInfo.score}, inferior a 650. ¿Desea continuar con el proceso de todas formas?`,
                    showCancelButton: true,
                    confirmButtonText: 'Sí, continuar',
                    cancelButtonText: 'Cancelar'
                });

                if (!confirm.isConfirmed) {
                    return;
                }
            }
        }

        // ✅ Validar si es SCORE_BAJO
        if (estadoSeleccionado === 'SCORE_BAJO') {
            if (!scoreInfo?.tiene_score || scoreInfo.score === null) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Score no disponible',
                    text: 'No se ha realizado la consulta de score para este asociado. Primero debe consultar el score en centrales de riesgo.'
                });
                return;
            }

            if (scoreInfo.score >= 650) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Score no aplica',
                    text: `El score del asociado es ${scoreInfo.score}, superior o igual a 650. No aplica para "Score bajo".`
                });
                return;
            }
        }

        // ✅ Verificar si requiere observaciones
        const opcion = OPCIONES_ESTADO.find(o => o.value === estadoSeleccionado);
        if (opcion?.requiereObservaciones && !observaciones.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Observaciones requeridas',
                text: `Para cambiar a "${opcion.label}" debe agregar observaciones.`
            });
            return;
        }

        try {
            setLoading(true);

            // ✅ Si es EN_TRAMITE, SOLO ejecutar pasar-fase2
            if (estadoSeleccionado === 'EN_TRAMITE') {
                const responseFase2 = await FetchDynamic(`/vinculacion/${solicitud?.id_solicitante}/pasar-fase2`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        score: scoreInfo?.score,
                        fecha_score: scoreInfo?.fecha_score
                    })
                });

                if (!responseFase2.ok) {
                    const result = await responseFase2.json();
                    throw new Error(result.message || 'Error al pasar a Fase 2');
                }

                const result = await responseFase2.json();

                Swal.fire({
                    icon: 'success',
                    title: '¡Fase 2 iniciada!',
                    text: 'El asociado ha pasado a Fase 2 exitosamente.',
                    timer: 2000,
                    showConfirmButton: false
                });

                onClose();
                if (onSuccess) onSuccess();
                setLoading(false);
                return;
            }

            // ✅ Para los demás estados, ejecutar cambiar-estado
            const response = await FetchDynamic(`/vinculacion/${solicitud?.id_solicitante}/cambiar-estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    estado: estadoSeleccionado,
                    motivo: observaciones || opcion?.description || ''
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al cambiar el estado');
            }

            Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: 'El estado de la solicitud ha sido actualizado correctamente.',
                timer: 2000,
                showConfirmButton: false
            });

            onClose();
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error instanceof Error ? error.message : 'Error al cambiar el estado'
            });
        } finally {
            setLoading(false);
        }
    };

    const getEstadoActualBadge = (estado: string) => {
        const configs: Record<string, { color: string }> = {
            'PENDIENTE': { color: 'bg-yellow-100 text-yellow-800' },
            'EN_REVISION': { color: 'bg-blue-100 text-blue-800' },
            'APROBADO': { color: 'bg-green-100 text-green-800' },
            'RECHAZADO': { color: 'bg-red-100 text-red-800' },
            'DESISTIMIENTO': { color: 'bg-gray-100 text-gray-800' },
            'CAPACIDAD_PAGO_NEGATIVA': { color: 'bg-orange-100 text-orange-800' },
            'SCORE_BAJO': { color: 'bg-purple-100 text-purple-800' },
            'EMBARGO': { color: 'bg-rose-100 text-rose-800' },
            'EMPRESA_PRIVADA': { color: 'bg-indigo-100 text-indigo-800' },
            'PENDIENTE_DATACREDITO': { color: 'bg-blue-100 text-blue-800' },
            'EN_TRAMITE': { color: 'bg-green-100 text-green-800' },
        };
        return configs[estado] || configs['PENDIENTE'];
    };

    // Verificar si la opción seleccionada requiere observaciones
    const opcionSeleccionada = OPCIONES_ESTADO.find(o => o.value === estadoSeleccionado);
    const requiereObservaciones = opcionSeleccionada?.requiereObservaciones || false;

    // Verificar si una opción está deshabilitada
    const isOptionDisabled = (opcion: typeof OPCIONES_ESTADO[0]) => {
        const estadoActual = solicitud?.estado || '';
        const tieneScore = scoreInfo?.tiene_score && scoreInfo.score !== null && scoreInfo.score !== undefined;

        if (estadoActual === opcion.value) {
            return true;
        }

        if (opcion.estadosOrigen && !opcion.estadosOrigen.includes(estadoActual)) {
            return true;
        }

        if (opcion.value === 'PENDIENTE_DATACREDITO' && tieneScore) {
            return true;
        }

        if (opcion.value === 'EN_TRAMITE' && !tieneScore) {
            return true;
        }

        if (opcion.value === 'SCORE_BAJO') {
            if (!tieneScore) {
                return true;
            }
            if (scoreInfo.score >= 650) {
                return true;
            }
        }

        return false;
    };

    if (!solicitud) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            className="border-0 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
        >
            <div className="bg-white dark:bg-gray-900">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Cambiar Estado
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {solicitud.nombres} {solicitud.apellidos} - Cédula: {solicitud.numero_documento}
                            </p>
                        </div>
                        <span className={cn(
                            'px-3 py-1 rounded-full text-sm font-semibold',
                            getEstadoActualBadge(solicitud.estado).color
                        )}>
                            Estado actual: {getEstadoLabel(solicitud.estado)}
                        </span>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Score info */}
                    {cargandoScore ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span className="ml-2 text-sm text-gray-500">Consultando score...</span>
                        </div>
                    ) : scoreInfo?.tiene_score && scoreInfo.score !== null ? (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-800 dark:text-gray-400">Score en centrales de riesgo</p>
                                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {scoreInfo.score}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {scoreInfo.score >= 650 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                Score aprobatorio
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                Score no aprobatorio
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-800 font-bold dark:text-gray-200">Fecha consulta</p>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {scoreInfo.fecha_score ? new Date(scoreInfo.fecha_score).toLocaleDateString('es-CO', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric'
                                        }) : 'No disponible'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                            <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                        No se ha realizado la consulta de score en centrales de riesgo
                                    </p>
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                        Para pasar a Fase 2, primero debe realizarse la consulta de score en Datacrédito.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Opciones de estado */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Seleccione el nuevo estado
                        </label>

                        {OPCIONES_ESTADO.map((opcion) => {
                            const disabled = isOptionDisabled(opcion);
                            const loadingDisabled = cargandoScore;
                            const esEstadoActual = solicitud?.estado === opcion.value;

                            return (
                                <div
                                    key={opcion.value}
                                    onClick={() => {
                                        if (!disabled && !loadingDisabled) {
                                            setEstadoSeleccionado(opcion.value);
                                        }
                                    }}
                                    className={cn(
                                        'p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                                        (disabled || loadingDisabled) ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300 dark:hover:border-blue-700',
                                        estadoSeleccionado === opcion.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : disabled || loadingDisabled
                                                ? 'border-gray-200 dark:border-gray-700'
                                                : 'border-gray-200 dark:border-gray-700',
                                        esEstadoActual && 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                                            estadoSeleccionado === opcion.value
                                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                                : esEstadoActual
                                                    ? 'bg-green-100 dark:bg-green-900/30'
                                                    : 'bg-gray-100 dark:bg-gray-700'
                                        )}>
                                            {React.cloneElement(opcion.icon, {
                                                className: cn('w-5 h-5', opcion.color)
                                            })}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                                        {opcion.label}
                                                        {esEstadoActual && (
                                                            <span className="ml-2 text-xs font-bold text-green-600 dark:text-green-400">
                                                                (Actual)
                                                            </span>
                                                        )}
                                                    </h4>
                                                    {opcion.esFase2 && (
                                                        <span className="ml-2 text-xs font-bold text-green-600 dark:text-green-400">
                                                            ⭐ Fase 2
                                                        </span>
                                                    )}
                                                    {disabled && !esEstadoActual && (
                                                        <span className="ml-2 text-xs text-red-500">
                                                            {opcion.value === 'EN_TRAMITE' && (!scoreInfo?.tiene_score || scoreInfo.score === null || scoreInfo.score === undefined)
                                                                ? '(Sin score)'
                                                                : opcion.value === 'SCORE_BAJO' && (scoreInfo?.score !== undefined && scoreInfo.score !== null && scoreInfo.score >= 650)
                                                                    ? '(Score > 650)'
                                                                    : opcion.value === 'PENDIENTE_DATACREDITO' && (scoreInfo?.tiene_score && scoreInfo.score !== null && scoreInfo.score !== undefined)
                                                                        ? '(Ya tiene score)'
                                                                        : '(No disponible)'}
                                                        </span>
                                                    )}
                                                    {loadingDisabled && (
                                                        <span className="ml-2 text-xs text-blue-500">
                                                            (Cargando...)
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={cn(
                                                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                                    estadoSeleccionado === opcion.value
                                                        ? 'border-blue-500 bg-blue-500'
                                                        : 'border-gray-300'
                                                )}>
                                                    {estadoSeleccionado === opcion.value && (
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {opcion.description}
                                            </p>
                                            {opcion.requiereObservaciones && (
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                    Requiere observaciones *
                                                </p>
                                            )}
                                            {esEstadoActual && (
                                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                    Este es el estado actual de la solicitud
                                                </p>
                                            )}
                                            {disabled && !esEstadoActual && (
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                    No disponible para este estado
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Observaciones - Solo si la opción seleccionada las requiere */}
                    {requiereObservaciones && (
                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Observaciones <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={observaciones}
                                onChange={(e) => setObservaciones(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors resize-none"
                                placeholder="Agregue observaciones adicionales sobre el cambio de estado..."
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {observaciones.length} caracteres
                            </p>
                        </div>
                    )}

                    {/* Mensaje informativo para Fase 2 */}
                    {estadoSeleccionado === 'EN_TRAMITE' && (
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Al pasar a Fase 2, se habilitará el formulario para diligenciar:
                            </p>
                            <ul className="text-sm text-green-600 dark:text-green-400 mt-1 ml-4 list-disc">
                                <li>2 referencias familiares</li>
                                <li>2 referencias personales</li>
                                <li>Información del cónyuge (si aplica)</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleCambiarEstado}
                            disabled={!estadoSeleccionado || loading}
                            className={cn(
                                'px-6 py-2 text-sm font-medium text-white rounded-lg transition-all',
                                !estadoSeleccionado || loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md'
                            )}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                                    Cambiando...
                                </>
                            ) : (
                                estadoSeleccionado === 'EN_TRAMITE' ? 'Pasar a Fase 2' : 'Cambiar Estado'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};