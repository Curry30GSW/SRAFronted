// src/components/ModalEditarF1.tsx

import React, { useState, useEffect } from 'react';
import { Modal } from "@/components/ui/Modals";
import { FetchDynamic } from '@/components/Api/FetchDynamic';
import Swal from 'sweetalert2';
import { Vinculacion } from '@/types/Vinculacion';
import { CitySelect } from '@/components/forms/CitySelect';


interface ModalEditarF1Props {
    isOpen: boolean;
    onClose: () => void;
    solicitud: Vinculacion | null;
    onSuccess?: () => void;
}

export const ModalEditarF1: React.FC<ModalEditarF1Props> = ({
    isOpen,
    onClose,
    solicitud,
    onSuccess
}) => {
    // ✅ Estado del formulario
    const [formData, setFormData] = useState<Partial<Vinculacion>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    //  Cargar datos al abrir el modal
    useEffect(() => {
        if (isOpen && solicitud) {
            console.log('📥 Cargando datos para editar:', solicitud);
            setFormData({
                tipo_documento: solicitud.tipo_documento || 'CC',
                numero_documento: solicitud.numero_documento || '',
                lugar_expedicion: solicitud.lugar_expedicion || '',
                fecha_expedicion: solicitud.fecha_expedicion?.split('T')[0] || '',
                nombres: solicitud.nombres || '',
                apellidos: solicitud.apellidos || '',
                fecha_nacimiento: solicitud.fecha_nacimiento?.split('T')[0] || '',
                lugar_nacimiento: solicitud.lugar_nacimiento || '',
                lugar_procedencia: solicitud.lugar_procedencia || '',
                ciudad_residencia: solicitud.ciudad_residencia || '',
                direccion_residencia: solicitud.direccion_residencia || '',
                tipo_trabajador: solicitud.tipo_trabajador || '',
                pagaduria: solicitud.pagaduria || '',
                empresa: solicitud.empresa || '',
                sector_empresa: solicitud.sector_empresa || '',
                cargo: solicitud.cargo || '',
                tiempo_cargo: solicitud.tiempo_cargo || '',
                direccion_correspondencia: solicitud.direccion_correspondencia || '',
                ciudad_correspondencia: solicitud.ciudad_correspondencia || '',
                telefonos: solicitud.telefonos || [],
                whatsapp: solicitud.whatsapp || '',
                correo_electronico: solicitud.correo_electronico || '',
                nivel_educativo: solicitud.nivel_educativo || '',
                estado_civil: solicitud.estado_civil || '',
                tiene_vivienda: solicitud.tiene_vivienda || false,
                tiene_vehiculo: solicitud.tiene_vehiculo || false,
                placa_vehiculo: solicitud.placa_vehiculo || ''
            });
        }
    }, [isOpen, solicitud]);

    // Manejar cambios en inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCityChange = (fieldName: keyof Vinculacion) => (value: string) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    }


    //  Manejar teléfonos (agregar/eliminar)
    const handleTelefonoChange = (index: number, value: string) => {
        setFormData(prev => {
            const telefonos = [...(prev.telefonos || [])];
            telefonos[index] = value;
            return { ...prev, telefonos };
        });
    };

    const agregarTelefono = () => {
        setFormData(prev => ({
            ...prev,
            telefonos: [...(prev.telefonos || []), '']
        }));
    };

    const eliminarTelefono = (index: number) => {
        setFormData(prev => {
            const telefonos = [...(prev.telefonos || [])];
            telefonos.splice(index, 1);
            return { ...prev, telefonos };
        });
    };

    // Enviar formulario
    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        if (!solicitud) return;

        // ✅ Validaciones
        if (!formData.nombres?.trim()) {
            setError('El nombre es requerido');
            return;
        }
        if (!formData.apellidos?.trim()) {
            setError('Los apellidos son requeridos');
            return;
        }
        if (!formData.numero_documento?.trim()) {
            setError('El número de documento es requerido');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {


            const response = await FetchDynamic(`/vinculacion/${solicitud.id_solicitante}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            //  Manejar errores
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Error al actualizar el registro');
            }

            // Éxito
            await Swal.fire({
                icon: 'success',
                title: '¡Registro actualizado!',
                text: 'Los datos se han actualizado correctamente',
                confirmButtonColor: '#2563eb',
                timer: 2000,
                timerProgressBar: true
            });

            if (onSuccess) {
                onSuccess();
            }

            onClose();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);

            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="xl"
            className="border-0 rounded-2xl shadow-2xl overflow-hidden"
        >
            <div className="bg-white dark:bg-gray-900 flex flex-col max-h-[80vh]">
                {/*  Encabezado */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-5 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Editar Solicitud F1</h2>
                            <p className="text-sm text-blue-100 mt-0.5">
                                {solicitud?.nombres} {solicitud?.apellidos}
                            </p>
                        </div>
                    </div>
                </div>

                {/*  Formulario */}
                <form onSubmit={handleSubmit} className="px-6 py-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/*  Datos Personales */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                            Datos Personales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Tipo de documento
                                </label>
                                <select
                                    name="tipo_documento"
                                    value={formData.tipo_documento || 'CC'}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="PA">Pasaporte</option>
                                </select>
                            </div> */}

                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Número de documento
                                </label>
                                <input
                                    type="text"
                                    name="numero_documento"
                                    value={formData.numero_documento || ''}
                                    onChange={handleChange}
                                    readOnly
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Lugar de expedición
                                </label>
                                {/* <input
                                    type="text"
                                    name="lugar_expedicion"
                                    value={formData.lugar_expedicion || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                /> */}

                                <CitySelect
                                    value={formData.lugar_expedicion || ''}
                                    onChange={handleCityChange('lugar_expedicion')}
                                    placeholder="Buscar ciudad..."
                                />


                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Nombres
                                </label>
                                <input
                                    type="text"
                                    name="nombres"
                                    value={formData.nombres || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Apellidos
                                </label>
                                <input
                                    type="text"
                                    name="apellidos"
                                    value={formData.apellidos || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Fecha de nacimiento
                                </label>
                                <input
                                    type="date"
                                    name="fecha_nacimiento"
                                    value={formData.fecha_nacimiento || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />

                            </div>
                        </div>
                    </div>

                    {/*  Residencia */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                            Residencia
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Ciudad de residencia
                                </label>

                                {/* <input
                                    type="text"
                                    name="ciudad_residencia"
                                    value={formData.ciudad_residencia || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                /> */}

                                <CitySelect
                                    value={formData.ciudad_residencia || ''}
                                    onChange={handleCityChange('ciudad_residencia')}
                                    placeholder="Buscar ciudad..."
                                />

                            </div>

                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Dirección de residencia
                                </label>
                                <input
                                    type="text"
                                    name="direccion_residencia"
                                    value={formData.direccion_residencia || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Nivel educativo
                                </label>
                                <select
                                    name="nivel_educativo"
                                    value={formData.nivel_educativo || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="PRIMARIA">Primaria</option>
                                    <option value="SECUNDARIA">Secundaria</option>
                                    <option value="TECNICO">Técnico</option>
                                    <option value="TECNOLOGO">Tecnólogo</option>
                                    <option value="PROFESIONAL">Profesional</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Estado civil
                                </label>
                                <select
                                    name="estado_civil"
                                    value={formData.estado_civil || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="SOLTERO">Soltero/a</option>
                                    <option value="CASADO">Casado/a</option>
                                    <option value="UNION_LIBRE">Unión Libre</option>
                                    <option value="DIVORCIADO">Divorciado/a</option>
                                    <option value="VIUDO">Viudo/a</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/*  Contacto */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                            Contacto
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    name="correo_electronico"
                                    value={formData.correo_electronico || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    WhatsApp
                                </label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    value={formData.whatsapp || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Teléfonos */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Teléfonos
                                </label>
                                <div className="space-y-2">
                                    {(formData.telefonos || []).map((telefono, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={telefono}
                                                onChange={(e) => handleTelefonoChange(index, e.target.value)}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                placeholder="Número de teléfono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => eliminarTelefono(index)}
                                                className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={agregarTelefono}
                                        className="w-full px-3 py-2 text-sm border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500"
                                    >
                                        + Agregar teléfono
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/*  Datos Laborales */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                            Datos Laborales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Tipo de trabajador
                                </label>
                                <select
                                    name="tipo_trabajador"
                                    value={formData.tipo_trabajador || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="EMPLEADO">Empleado</option>
                                    <option value="PENSIONADO">Pensionado</option>
                                </select>
                            </div>

                            {formData.tipo_trabajador === 'PENSIONADO' && (
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Pagaduría
                                    </label>
                                    <input
                                        type="text"
                                        name="pagaduria"
                                        value={formData.pagaduria || ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                            )}

                            {formData.tipo_trabajador === 'EMPLEADO' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Empresa
                                        </label>
                                        <input
                                            type="text"
                                            name="empresa"
                                            value={formData.empresa || ''}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                            Cargo
                                        </label>
                                        <input
                                            type="text"
                                            name="cargo"
                                            value={formData.cargo || ''}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/*  Vivienda y Vehículo */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                            Vivienda y Vehículo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="tiene_vivienda"
                                    checked={formData.tiene_vivienda || false}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label className="text-sm text-gray-700 dark:text-gray-300">
                                    ¿Tiene vivienda?
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="tiene_vehiculo"
                                    checked={formData.tiene_vehiculo || false}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <label className="text-sm text-gray-700 dark:text-gray-300">
                                    ¿Tiene vehículo?
                                </label>
                            </div>

                            {formData.tiene_vehiculo && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Placa del vehículo
                                    </label>
                                    <input
                                        type="text"
                                        name="placa_vehiculo"
                                        value={formData.placa_vehiculo || ''}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/*  Botones */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
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
                                <>

                                    Guardar cambios
                                </>
                            )}
                        </button>
                    </div>

                </form>

            </div>
        </Modal>
    );
};