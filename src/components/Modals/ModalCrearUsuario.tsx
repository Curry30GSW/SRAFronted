import { useState } from "react";
import Swal from "sweetalert2";
import { FetchDynamic } from "../Api/FetchDynamic";
import { Modal } from '../ui/Modals/index';


interface ModalCrearUsuarioProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    usuario?: any;
}

interface FormData {
    nombre: string;
    usuario: string;
    contraseña: string;
    rol: string;
    activo: number;
}


export const ModalCrearUsuario: React.FC<ModalCrearUsuarioProps> = ({
    isOpen,
    onClose,
    onSuccess,
    usuario
}) => {

    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        usuario: '',
        contraseña: '',
        rol: 'admin',
        activo: 1
    });


    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const validateForm = (): boolean => {

        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            return false;
        }

        if (!formData.usuario.trim()) {
            setError('El nombre de usuario es requerido');
            return false;
        }
        if (!formData.contraseña.trim()) {
            setError('La contraseña es requerida');
            return false;
        }
        if (formData.contraseña.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        if (!formData.rol) {
            setError('El rol es requerido');
            return false;
        }
        setError(null);
        return true;
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const response = await FetchDynamic('/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })


            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al guardar la gestión");
            }

            const result = await response.json();

            await Swal.fire({
                icon: 'success',
                title: '¡Usuario creado!',
                text: `El usuario "${formData.usuario}" ha sido creado exitosamente.`,
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'Entendido',
                timer: 3000,
                timerProgressBar: true,
            });

            //  Resetear formulario
            setFormData({
                nombre: '',
                usuario: '',
                contraseña: '',
                rol: 'funcionario',
                activo: 1
            });


            if (onSuccess) {
                onSuccess();
            }

            onClose();


        } catch (error) {

        }
    }

    const handleClose = () => {
        setFormData({
            nombre: '',
            usuario: '',
            contraseña: '',
            rol: 'funcionario',
            activo: 1,

        });
        setError(null);
        onClose();
    }

    return (
        <Modal isOpen={isOpen}
            onClose={handleClose}
            size="lg"
            className="border-0 rounded-2xl shadow-2xl overflow-hidden">

            <div className="bg-white dark:bg-gray-900 flex flex-col max-h-[90vh]">
                {/* Encabezado */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-5 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Crear Nuevo Usuario</h2>
                            <p className="text-sm text-blue-100 mt-0.5">Ingrese los datos del nuevo usuario</p>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre"
                                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Usuario <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="usuario"
                                value={formData.usuario}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre de usuario"
                                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>



                    </div>



                    {/*  Grid 3 columnas: Rol, Activo y Estado (placeholder) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Contraseña <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="contraseña"
                                value={formData.contraseña}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres"
                                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />

                        </div>

                        {/* Rol */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Rol <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="rol"
                                value={formData.rol}
                                onChange={handleChange}
                                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            >
                                <option value="usuario">Usuario</option>
                                <option value="admin">Administrador</option>
                                <option value="funcionario">Funcionario</option>
                            </select>
                        </div>

                        {/* Activo */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                                Estado
                            </label>
                            <select
                                name="activo"
                                value={formData.activo}
                                onChange={handleChange}
                                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            >
                                <option value={1}>Activo</option>
                                <option value={0}>Inactivo</option>
                            </select>
                        </div>

                        {/*  Campo adicional (opcional) */}
                        {/* <div className="flex items-end">
                            <div className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    🔒 Seguridad
                                </p>
                                <p className="text-xs text-blue-500 dark:text-blue-400/70 mt-0.5">
                                    El usuario podrá iniciar sesión con sus credenciales
                                </p>
                            </div>
                        </div> */}

                    </div>

                    {/*  Botones */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
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
                                    Creando...
                                </>
                            ) : (
                                <>
                                    Crear Usuario
                                </>
                            )}
                        </button>
                    </div>

                </form>

            </div>

        </Modal>
    )

}