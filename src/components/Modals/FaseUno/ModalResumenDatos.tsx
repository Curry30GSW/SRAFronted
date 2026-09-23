import React, { useState } from 'react'
import { Modal } from '../../ui/Modals'
import { FormData } from '@/types/AsociacionForm'
import { AGENCIAS } from '@/constants/agencias'
import { MapPin } from 'lucide-react'

interface ModalResumenDatosProps {
    isOpen: boolean
    onClose: () => void
    datos: FormData
    onConfirm: () => void
    isLoading?: boolean
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

const SeccionColapsable: React.FC<{
    numero: string;
    titulo: string;
    estaAbierta: boolean;
    onToggle: () => void;
    completados: number;
    total: number;
    children: React.ReactNode;
}> = ({ numero, titulo, estaAbierta, onToggle, completados, total, children }) => {
    const completo = completados === total;

    return (
        <div className="mb-2 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden bg-white dark:bg-gray-900">
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-150"
            >
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900">
                        <span className="text-[11px] font-bold text-green-700 dark:text-green-400 tracking-wide">
                            {numero}
                        </span>
                    </div>

                    <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                            {titulo}
                        </span>
                        <span className={`text-[10px] font-medium uppercase tracking-wider mt-0.5 ${completo
                            ? 'text-green-600 dark:text-green-500'
                            : 'text-gray-400 dark:text-gray-500'
                            }`}>
                            {completo ? 'Completo' : `${completados} de ${total} campos`}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${completo ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                    <svg
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${estaAbierta ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            <div className={`grid transition-all duration-200 ease-out ${estaAbierta ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}>
                <div className="overflow-hidden">
                    <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-800">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const GridItem: React.FC<{ label: string; valor: string | React.ReactNode }> = ({ label, valor }) => (
    <div className="py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
        <p className="text-[11px] font-bold text-gray-800 dark:text-gray-500 uppercase tracking-wider">
            {label}
        </p>
        <p className="text-[13px] text-gray-800 dark:text-gray-100 mt-1 break-words leading-snug">
            {valor || <span className="text-gray-400 dark:text-gray-600 italic font-normal">No registra</span>}
        </p>
    </div>
);

const BadgeItem: React.FC<{
    label: string;
    activo: boolean;
    textoActivo?: string;
    textoInactivo?: string;
}> = ({ label, activo, textoActivo = 'Aceptado', textoInactivo = 'No aceptado' }) => (
    <div className={`py-3 px-4 rounded-md border ${activo
        ? 'bg-green-50/60 dark:bg-green-950/20 border-green-200 dark:border-green-900'
        : 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900'
        }`}>
        <p className="text-[11px] font-bold text-gray-800 dark:text-gray-500 uppercase tracking-wider">
            {label}
        </p>
        <p className={`text-[13px] font-semibold mt-1.5 ${activo ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            }`}>
            {activo ? textoActivo : textoInactivo}
        </p>
    </div>
);

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export const ModalResumenDatos: React.FC<ModalResumenDatosProps> = ({
    isOpen,
    onClose,
    onConfirm,
    datos,
    isLoading = false
}) => {

    const [seccionesAbiertas, setSeccionesAbiertas] = useState({
        agencia: true,          // ✅ NUEVA
        personales: true,
        residencia: false,
        laborales: false,
        contacto: false,
        autorizaciones: false,
    });

    const toggleSeccion = (seccion: keyof typeof seccionesAbiertas) => {
        setSeccionesAbiertas(prev => ({ ...prev, [seccion]: !prev[seccion] }));
    };

    // ============================================================
    // FORMATEADORES
    // ============================================================

    const formatFecha = (fecha: string) => {
        if (!fecha) return 'No registra';
        try {
            const date = new Date(fecha);
            return date.toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return fecha;
        }
    };

    const formatTelefonos = (telefonos: string[]) => {
        if (!telefonos || telefonos.length === 0) return 'No registra';
        return telefonos.join(' / ');
    };

    const getTipoDocumento = (tipo: string) => {
        const tipos: Record<string, string> = {
            'CC': 'Cédula de Ciudadanía',
            'CE': 'Cédula de Extranjería',
            'NIT': 'NIT',
            'PA': 'Pasaporte',
        };
        return tipos[tipo] || tipo || 'No registra';
    };

    const getTipoTrabajador = (tipo: string) => {
        const tipos: Record<string, string> = {
            'trabajador': 'Trabajador',
            'pensionado': 'Pensionado',
        };
        return tipos[tipo] || tipo || 'No registra';
    };

    const getSiNo = (valor: boolean | string) => {
        if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
        return valor || 'No registra';
    };

    const esEmpleado = ['trabajador'].includes(datos.tipoTrabajador?.toLowerCase() || '');
    const esPensionado = ['pensionado'].includes(datos.tipoTrabajador?.toLowerCase() || '');
    const tieneVehiculo = datos.tieneVehiculo === true;

    // ✅ Detectar si hay agencia seleccionada (vinculación espontánea)
    const agenciaSeleccionada = datos.agencia
        ? AGENCIAS.find(a => a.codigo === datos.agencia)
        : null
    const mostrarSeccionAgencia = Boolean(agenciaSeleccionada)

    // ============================================================
    // CONTADORES DE PROGRESO
    // ============================================================

    const contarCompletados = (valores: (string | undefined | null)[]): number =>
        valores.filter(v => v && String(v).trim() !== '').length;

    const progreso = {
        // ✅ NUEVA sección (solo cuenta si aplica)
        agencia: {
            completados: mostrarSeccionAgencia ? 1 : 0,
            total: mostrarSeccionAgencia ? 1 : 0
        },
        personales: {
            completados: contarCompletados([
                datos.tipoDocumento, datos.cedula, datos.nombres, datos.apellidos,
                datos.fechaNacimiento, datos.lugarNacimiento, datos.fechaExpedicion, datos.lugarExpedicion
            ]),
            total: 8
        },
        residencia: {
            completados: contarCompletados([
                datos.ciudadResidencia, datos.direccionResidencia,
                datos.ciudadCorrespondencia, datos.direccionCorrespondencia
            ]),
            total: 4
        },
        laborales: {
            completados: esEmpleado
                ? contarCompletados([datos.empresa, datos.sectorEmpresa, datos.cargo, datos.tiempoCargo])
                : esPensionado
                    ? contarCompletados([datos.pagaduria])
                    : 1,
            total: esEmpleado ? 4 : 1
        },
        contacto: {
            completados: contarCompletados([
                datos.nivelEducativo, datos.estadoCivil,
                String(datos.tieneVivienda), String(datos.tieneVehiculo),
                datos.telefonos?.join(','), datos.whatsapp, datos.correo
            ]),
            total: 7
        },
        autorizaciones: {
            completados: [datos.autorizaCentralesRiesgo, datos.aceptaTratamientoDatos, datos.autorizaAperturaCuenta]
                .filter(Boolean).length,
            total: 3
        }
    };

    const totalGeneral = Object.values(progreso).reduce((acc, p) => acc + p.completados, 0);
    const totalCampos = Object.values(progreso).reduce((acc, p) => acc + p.total, 0);
    const porcentaje = totalCampos > 0 ? Math.round((totalGeneral / totalCampos) * 100) : 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            className="border-0 rounded-lg shadow-2xl overflow-hidden"
        >
            <div className="bg-white dark:bg-gray-900 flex flex-col max-h-[85vh]">

                {/* ============ HEADER ============ */}
                <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-8 py-6 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-12 bg-white/40 rounded-full" />
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight">
                                    Confirmar datos personales
                                </h2>
                                <p className="text-[11px] text-green-50 mt-0.5 tracking-wide">
                                    Revisa cada sección antes de enviar la solicitud
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-green-50/70 hover:text-white transition-colors text-2xl leading-none px-2 -mt-1"
                            aria-label="Cerrar"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mt-5 flex items-center gap-4">
                        <div className="flex-1">
                            <div className="h-[3px] w-full bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-500"
                                    style={{ width: `${porcentaje}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-[11px] font-semibold text-green-50 tracking-wider tabular-nums">
                            {totalGeneral}/{totalCampos}
                        </span>
                    </div>
                </div>

                {/* ============ CONTENIDO ============ */}
                <div className="px-8 py-6 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-gray-950/30">

                    {/* ============================================================
                        ✅ NUEVA SECCIÓN: AGENCIA (al inicio, solo si aplica)
                        ============================================================ */}
                    {mostrarSeccionAgencia && agenciaSeleccionada && (
                        <div className="mb-3">
                            {/* Banner destacado */}
                            <div className="rounded-lg overflow-hidden border-2 border-green-600/40 dark:border-green-700/50 shadow-sm">
                                {/* Header del banner */}
                                <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-5 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-bold uppercase tracking-widest text-green-50/90">
                                                Agencia de vinculación
                                            </p>
                                            <p className="text-sm font-bold text-white tracking-tight">
                                                {agenciaSeleccionada.nombre}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[12px] font-bold uppercase tracking-widest text-green-50/80">
                                            Código (C.O)
                                        </p>
                                        <p className="text-sm font-mono font-bold text-white">
                                            {agenciaSeleccionada.codigo}
                                        </p>
                                    </div>
                                </div>

                                {/* Dirección */}
                                <div className="bg-white dark:bg-gray-900 px-5 py-3 flex items-start gap-2.5">
                                    <MapPin className="w-4 h-4 text-green-700 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">
                                            Dirección de la agencia
                                        </p>
                                        <p className="text-[12px] text-gray-800 dark:text-gray-200 leading-snug">
                                            {agenciaSeleccionada.direccion}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Nota debajo del banner */}
                            <p className="text-[12px] text-gray-800 font-semibold dark:text-gray-500 mt-2 px-1">
                                Esta es la agencia a la que será asignado(a) una vez aprobada su solicitud.
                            </p>
                        </div>
                    )}

                    {/* ---- 01 Datos Personales ---- */}
                    <SeccionColapsable
                        numero="01"
                        titulo="Datos Personales"
                        estaAbierta={seccionesAbiertas.personales}
                        onToggle={() => toggleSeccion('personales')}
                        completados={progreso.personales.completados}
                        total={progreso.personales.total}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
                            <GridItem label="Tipo de documento" valor={getTipoDocumento(datos.tipoDocumento)} />
                            <GridItem label="Número de cédula" valor={datos.cedula} />
                            <GridItem label="Nombres" valor={datos.nombres} />
                            <GridItem label="Apellidos" valor={datos.apellidos} />
                            <GridItem label="Fecha de nacimiento" valor={formatFecha(datos.fechaNacimiento)} />
                            <GridItem label="Lugar de nacimiento" valor={datos.lugarNacimiento || 'No registra'} />
                            <GridItem label="Fecha de expedición" valor={formatFecha(datos.fechaExpedicion)} />
                            <GridItem label="Lugar de expedición" valor={datos.lugarExpedicion || 'No registra'} />
                        </div>
                    </SeccionColapsable>

                    {/* ---- 02 Residencia ---- */}
                    <SeccionColapsable
                        numero="02"
                        titulo="Residencia"
                        estaAbierta={seccionesAbiertas.residencia}
                        onToggle={() => toggleSeccion('residencia')}
                        completados={progreso.residencia.completados}
                        total={progreso.residencia.total}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
                            <GridItem label="Ciudad de residencia" valor={datos.ciudadResidencia} />
                            <GridItem label="Dirección de residencia" valor={datos.direccionResidencia} />
                            <GridItem label="Ciudad de correspondencia" valor={datos.ciudadCorrespondencia || 'No registra'} />
                            <GridItem label="Dirección de correspondencia" valor={datos.direccionCorrespondencia || 'No registra'} />
                        </div>
                    </SeccionColapsable>

                    {/* ---- 03 Datos Laborales ---- */}
                    <SeccionColapsable
                        numero="03"
                        titulo="Datos Laborales"
                        estaAbierta={seccionesAbiertas.laborales}
                        onToggle={() => toggleSeccion('laborales')}
                        completados={progreso.laborales.completados}
                        total={progreso.laborales.total}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
                            <GridItem label="Tipo de trabajador" valor={getTipoTrabajador(datos.tipoTrabajador)} />

                            {esPensionado && (
                                <GridItem label="Pagaduría" valor={datos.pagaduria || 'No registra'} />
                            )}

                            {esEmpleado && (
                                <>
                                    <GridItem label="Empresa" valor={datos.empresa || 'No registra'} />
                                    <GridItem label="Sector de la empresa" valor={datos.sectorEmpresa} />
                                    <GridItem label="Cargo" valor={datos.cargo || 'No registra'} />
                                    <GridItem label="Tiempo en el cargo" valor={datos.tiempoCargo || 'No registra'} />
                                </>
                            )}
                        </div>
                    </SeccionColapsable>

                    {/* ---- 04 Contacto ---- */}
                    <SeccionColapsable
                        numero="04"
                        titulo="Contacto"
                        estaAbierta={seccionesAbiertas.contacto}
                        onToggle={() => toggleSeccion('contacto')}
                        completados={progreso.contacto.completados}
                        total={progreso.contacto.total}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
                            <GridItem label="Nivel educativo" valor={datos.nivelEducativo} />
                            <GridItem label="Estado civil" valor={datos.estadoCivil} />
                            <GridItem label="¿Tiene vivienda?" valor={getSiNo(datos.tieneVivienda)} />
                            <GridItem label="¿Tiene vehículo?" valor={getSiNo(datos.tieneVehiculo)} />
                            {tieneVehiculo && (
                                <GridItem label="Placa vehículo" valor={datos.placaVehiculo || 'No registra'} />
                            )}
                            <GridItem label="Teléfonos" valor={formatTelefonos(datos.telefonos)} />
                            <GridItem label="WhatsApp" valor={datos.whatsapp || 'No registra'} />
                            <GridItem label="Correo electrónico" valor={datos.correo} />
                        </div>
                    </SeccionColapsable>

                    {/* ---- 05 Autorizaciones ---- */}
                    <SeccionColapsable
                        numero="05"
                        titulo="Autorizaciones"
                        estaAbierta={seccionesAbiertas.autorizaciones}
                        onToggle={() => toggleSeccion('autorizaciones')}
                        completados={progreso.autorizaciones.completados}
                        total={progreso.autorizaciones.total}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <BadgeItem
                                label="Central de Riesgos"
                                activo={!!datos.autorizaCentralesRiesgo}
                                textoActivo="Autorizado"
                                textoInactivo="No autorizado"
                            />
                            <BadgeItem
                                label="Tratamiento de datos"
                                activo={!!datos.aceptaTratamientoDatos}
                                textoActivo="Aceptado"
                                textoInactivo="No aceptado"
                            />
                            <BadgeItem
                                label="Apertura de cuenta"
                                activo={!!datos.autorizaAperturaCuenta}
                                textoActivo="Autorizada"
                                textoInactivo="No autorizada"
                            />
                        </div>
                    </SeccionColapsable>

                    {/* ---- NOTA INFORMATIVA ---- */}
                    <div className="mt-5 px-5 py-4 bg-white dark:bg-gray-900 border-l-[3px] border-green-700 dark:border-green-700 rounded-r-md">
                        <p className="text-[11px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider mb-1">
                            Verifica tus datos antes de continuar
                        </p>
                        <p className="text-[11px] text-gray-800 dark:text-gray-400 leading-relaxed">
                            Después de enviar la solicitud, no podrás modificar la información.
                            Asegúrate de que todos los datos sean correctos.
                        </p>
                    </div>
                </div>

                {/* ============ FOOTER ============ */}
                <div className="px-8 py-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-6 py-2.5 text-[13px] font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors duration-150 disabled:opacity-50 tracking-wide"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 px-6 py-2.5 text-[13px] font-semibold text-white bg-green-700 hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-600 rounded-md transition-colors duration-150 disabled:opacity-50 flex items-center justify-center gap-2 tracking-wide shadow-sm hover:shadow-md"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Enviando...
                                </>
                            ) : (
                                'Confirmar y enviar solicitud'
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </Modal>
    );
}