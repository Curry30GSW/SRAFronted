import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modals";
import { FetchDynamic } from "@/components/Api/FetchDynamic";
import Swal from "sweetalert2";

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

const GrupoReferencia: React.FC<{
    titulo: string;
    descripcion?: string;
    children: React.ReactNode
}> = ({ titulo, descripcion, children }) => (
    <div className="mb-5">
        <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-widest">
                {titulo}
            </h4>
            {descripcion && (
                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-normal normal-case tracking-normal">
                    {descripcion}
                </span>
            )}
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const InputField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    type?: string;
}> = ({ label, name, value, onChange, placeholder, required, type = 'text' }) => (
    <div className="group">
        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all duration-200"
        />
    </div>
);

const ReferenciaCard: React.FC<{
    numero: number;
    children: React.ReactNode
}> = ({ numero, children }) => (
    <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-800">
        <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center">
            <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">{numero}</span>
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {children}
        </div>
    </div>
);

// ============================================================
// INTERFACES
// ============================================================

interface Fase2Item {
    id_fase2: number;
    id_postulacion: number;
    id_asociado: number;
    score: number;
    fecha_score: string;
    familiar1_nombre: string;
    familiar1_parentesco: string;
    familiar1_telefono: string;
    familiar2_nombre: string;
    familiar2_parentesco: string;
    familiar2_telefono: string;
    personal1_nombre: string;
    personal1_telefono: string;
    personal1_direccion: string;
    personal2_nombre: string;
    personal2_telefono: string;
    personal2_direccion: string;
    conyuge_nombre: string;
    conyuge_cedula: string;
    conyuge_telefono: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    estado: string;
    nombres: string;
    apellidos: string;
    numero_documento: string;
    correo_electronico: string;
}

interface ModalFase2ReferenciasProps {
    isOpen: boolean;
    onClose: () => void;
    solicitud: Fase2Item | null;
    onSuccess?: () => void
}

interface ReferenciasData {
    familiar1_nombre: string;
    familiar1_parentesco: string;
    familiar1_telefono: string;
    familiar2_nombre: string;
    familiar2_parentesco: string;
    familiar2_telefono: string;
    personal1_nombre: string;
    personal1_telefono: string;
    personal1_direccion: string;
    personal2_nombre: string;
    personal2_telefono: string;
    personal2_direccion: string;
    conyuge_nombre: string;
    conyuge_cedula: string;
    conyuge_telefono: string;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export const ModalFase2Referencias: React.FC<ModalFase2ReferenciasProps> = ({
    isOpen,
    onClose,
    solicitud,
    onSuccess
}) => {

    const initialFormData: ReferenciasData = {
        familiar1_nombre: '',
        familiar1_parentesco: '',
        familiar1_telefono: '',
        familiar2_nombre: '',
        familiar2_parentesco: '',
        familiar2_telefono: '',
        personal1_nombre: '',
        personal1_telefono: '',
        personal1_direccion: '',
        personal2_nombre: '',
        personal2_telefono: '',
        personal2_direccion: '',
        conyuge_nombre: '',
        conyuge_cedula: '',
        conyuge_telefono: '',
    }

    const [formData, setFormData] = useState<ReferenciasData>(initialFormData)
    const idPostulacion = solicitud?.id_postulacion || null;
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && solicitud) {
            cargarDatosExisten()
        }
    }, [isOpen, solicitud]);

    const cargarDatosExisten = () => {
        setFormData({
            familiar1_nombre: solicitud?.familiar1_nombre || '',
            familiar1_parentesco: solicitud?.familiar1_parentesco || '',
            familiar1_telefono: solicitud?.familiar1_telefono || '',
            familiar2_nombre: solicitud?.familiar2_nombre || '',
            familiar2_parentesco: solicitud?.familiar2_parentesco || '',
            familiar2_telefono: solicitud?.familiar2_telefono || '',
            personal1_nombre: solicitud?.personal1_nombre || '',
            personal1_telefono: solicitud?.personal1_telefono || '',
            personal1_direccion: solicitud?.personal1_direccion || '',
            personal2_nombre: solicitud?.personal2_nombre || '',
            personal2_telefono: solicitud?.personal2_telefono || '',
            personal2_direccion: solicitud?.personal2_direccion || '',
            conyuge_nombre: solicitud?.conyuge_nombre || '',
            conyuge_cedula: solicitud?.conyuge_cedula || '',
            conyuge_telefono: solicitud?.conyuge_telefono || '',
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.familiar1_nombre || !formData.familiar1_parentesco || !formData.familiar1_telefono) {
            setError('Complete al menos los datos del familiar 1');
            return false;
        }
        setError(null);
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!idPostulacion) {
            setError('campo requerido')
            return
        }

        if (!validateForm()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await FetchDynamic(`/vinculacion/postulacion/${idPostulacion}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.message || 'Error al guardar las referencias');
            }

            await Swal.fire({
                title: "Guardado Exitoso!",
                icon: "success",
                draggable: true
            })

            if (onSuccess) onSuccess()
            onClose()

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setFormData(initialFormData);
        setError(null);
        onClose();
    };

    // Contar campos completados para el progreso
    const camposRequeridos = [
        formData.familiar1_nombre,
        formData.familiar1_parentesco,
        formData.familiar1_telefono,
        formData.personal1_nombre,
        formData.personal1_telefono,
        formData.personal1_direccion
    ];
    const completados = camposRequeridos.filter(c => c && c.trim() !== '').length;
    const progreso = Math.round((completados / camposRequeridos.length) * 100);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="lg"
            className="border-0 rounded-2xl shadow-2xl overflow-hidden"
        >
            <div className="bg-white dark:bg-gray-900 flex flex-col max-h-[85vh]">

                {/* ============ HEADER ============ */}
                <div className="px-7 pt-6 pb-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                                Referencias Personales
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {solicitud?.nombres} {solicitud?.apellidos} · Doc. {solicitud?.numero_documento}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-xl leading-none px-2"
                            aria-label="Cerrar"
                        >
                            ×
                        </button>
                    </div>

                    {/* Barra de progreso sutil */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                                Progreso
                            </span>
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                {progreso}%
                            </span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                                style={{ width: `${progreso}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* ============ CONTENIDO ============ */}
                <form onSubmit={handleSubmit} className="px-7 py-6 overflow-y-auto flex-1">

                    {error && (
                        <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-950/30 border-l-2 border-red-500 rounded-r-lg">
                            <p className="text-xs text-red-700 dark:text-red-300 font-medium">{error}</p>
                        </div>
                    )}

                    {/* --- FAMILIARES --- */}
                    <GrupoReferencia titulo="Referencias Familiares" descripcion="Mínimo 1">

                        <ReferenciaCard numero={1}>
                            <InputField
                                label="Nombre completo"
                                name="familiar1_nombre"
                                value={formData.familiar1_nombre}
                                onChange={handleChange}
                                placeholder="Nombre del familiar"
                                required
                            />
                            <InputField
                                label="Parentesco"
                                name="familiar1_parentesco"
                                value={formData.familiar1_parentesco}
                                onChange={handleChange}
                                placeholder="Ej: Hermano"
                                required
                            />
                            <InputField
                                label="Teléfono"
                                name="familiar1_telefono"
                                value={formData.familiar1_telefono}
                                onChange={handleChange}
                                placeholder="3111234567"
                                required
                                type="tel"
                            />
                        </ReferenciaCard>

                        <ReferenciaCard numero={2}>
                            <InputField
                                label="Nombre completo"
                                name="familiar2_nombre"
                                value={formData.familiar2_nombre}
                                onChange={handleChange}
                                placeholder="Nombre del familiar"
                            />
                            <InputField
                                label="Parentesco"
                                name="familiar2_parentesco"
                                value={formData.familiar2_parentesco}
                                onChange={handleChange}
                                placeholder="Ej: Primo"
                            />
                            <InputField
                                label="Teléfono"
                                name="familiar2_telefono"
                                value={formData.familiar2_telefono}
                                onChange={handleChange}
                                placeholder="3111234567"
                                type="tel"
                            />
                        </ReferenciaCard>
                    </GrupoReferencia>

                    {/* --- PERSONALES --- */}
                    <GrupoReferencia titulo="Referencias Personales" descripcion="Mínimo 1">

                        <ReferenciaCard numero={1}>
                            <InputField
                                label="Nombre completo"
                                name="personal1_nombre"
                                value={formData.personal1_nombre}
                                onChange={handleChange}
                                placeholder="Nombre de la referencia"
                                required
                            />
                            <InputField
                                label="Teléfono"
                                name="personal1_telefono"
                                value={formData.personal1_telefono}
                                onChange={handleChange}
                                placeholder="3111234567"
                                type="tel"
                                required
                            />
                            <InputField
                                label="Dirección"
                                name="personal1_direccion"
                                value={formData.personal1_direccion}
                                onChange={handleChange}
                                placeholder="Calle 123 # 45-67"
                                required
                            />
                        </ReferenciaCard>

                        <ReferenciaCard numero={2}>
                            <InputField
                                label="Nombre completo"
                                name="personal2_nombre"
                                value={formData.personal2_nombre}
                                onChange={handleChange}
                                placeholder="Nombre de la referencia"
                            />
                            <InputField
                                label="Teléfono"
                                name="personal2_telefono"
                                value={formData.personal2_telefono}
                                onChange={handleChange}
                                placeholder="3111234567"
                                type="tel"
                            />
                            <InputField
                                label="Dirección"
                                name="personal2_direccion"
                                value={formData.personal2_direccion}
                                onChange={handleChange}
                                placeholder="Calle 123 # 45-67"
                            />
                        </ReferenciaCard>
                    </GrupoReferencia>

                    {/* --- CÓNYUGE --- */}
                    <GrupoReferencia titulo="Datos del Cónyuge" descripcion="Opcional">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <InputField
                                label="Nombre completo"
                                name="conyuge_nombre"
                                value={formData.conyuge_nombre}
                                onChange={handleChange}
                                placeholder="Nombre del cónyuge"
                            />
                            <InputField
                                label="Cédula"
                                name="conyuge_cedula"
                                value={formData.conyuge_cedula}
                                onChange={handleChange}
                                placeholder="123456789"
                            />
                            <InputField
                                label="Teléfono"
                                name="conyuge_telefono"
                                value={formData.conyuge_telefono}
                                onChange={handleChange}
                                placeholder="3111234567"
                                type="tel"
                            />
                        </div>
                    </GrupoReferencia>

                    {/* --- NOTA INFORMATIVA --- */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-l-2 border-gray-300 dark:border-gray-600 rounded-r-lg">
                        <p className="text-[13px] text-gray-700 dark:text-gray-400 leading-relaxed">
                            Los campos marcados con <span className="font-bold text-red-500">*</span> son obligatorios.
                            Debe completar al menos una referencia familiar y una personal.
                        </p>
                    </div>

                    {/* --- FOOTER --- */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-7 pt-5 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Guardando...
                                </>
                            ) : (
                                'Guardar referencias'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    )
}