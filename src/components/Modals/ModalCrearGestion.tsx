import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FetchDynamic } from "../Api/FetchDynamic";
import { Modal } from '../ui/Modals/index';

interface ModalCrearGestionProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    asociado: {
        NCTA05: string;
        DESC05: string;
        NNIT05: string;
        BASE05: string;
        DESC04: string;
    } | null;
}

export default function ModalCrearGestion({
    isOpen,
    onClose,
    onSuccess,
    asociado
}: ModalCrearGestionProps) {
    const [gestion, setGestion] = useState("");
    const [caracteresRestantes, setCaracteresRestantes] = useState(500);
    const [loading, setLoading] = useState(false);

    const MAX_CARACTERES = 500;

    useEffect(() => {
        if (!isOpen) {
            setGestion("");
            setCaracteresRestantes(MAX_CARACTERES);
        }
    }, [isOpen]);

    useEffect(() => {
        setCaracteresRestantes(MAX_CARACTERES - gestion.length);
    }, [gestion]);

    const guardarGestion = async () => {
        if (!asociado) {
            Swal.fire({
                icon: "warning",
                title: "Asociado requerido",
                text: "No se ha seleccionado un asociado",
            });
            return;
        }

        if (!gestion.trim()) {
            Swal.fire({
                icon: "warning",
                title: "Gestión vacía",
                text: "Debe ingresar una gestión",
            });
            return;
        }

        if (gestion.length > MAX_CARACTERES) {
            Swal.fire({
                icon: "warning",
                title: "Límite excedido",
                text: `La gestión no puede superar ${MAX_CARACTERES} caracteres`,
            });
            return;
        }

        setLoading(true);

        try {
            // ✅ Obtener usuario de sesión (si existe)
            const usuario = localStorage.getItem('usuario') || 'SISTEMA';

            const response = await FetchDynamic("/api/gestion", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cedula: asociado.NNIT05,
                    nombre: asociado.DESC05.toUpperCase(),
                    cuenta: asociado.NCTA05,
                    gestion: gestion.trim().toUpperCase(),
                    nomina: asociado.DESC04,
                    salario: asociado.BASE05,
                    usuario_gestion: usuario  // ✅ Enviar usuario
                }),
            });

            if (response.status === 401) {
                Swal.fire({
                    icon: "error",
                    title: "Sesión expirada",
                    text: "Por favor inicie sesión nuevamente",
                }).then(() => {
                    window.location.href = "/auth";
                });
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al guardar la gestión");
            }

            await response.json();
            onClose();

            Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: "Gestión registrada correctamente ✅",
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                if (onSuccess) onSuccess();
            });

        } catch (error: unknown) {
            console.error("Error guardando gestión:", error);
            const errorMessage = error instanceof Error ? error.message : "No se pudo registrar la nueva gestión";
            Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            className="max-h-[90vh] overflow-hidden border-0 rounded-2xl shadow-2xl"
        >
            {/* Header con barra lateral de color */}
            <div className="relative">
                <div className="pl-6 pr-6 py-5 bg-white dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                                Nueva Gestión
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                Registro de gestión para asociado retirado
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="px-6 py-6 bg-gray-50/50 dark:bg-gray-800/30 space-y-6">
                {/* Información del Asociado - Diseño de grid elegante */}
                {asociado && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-lg font-medium text-gray-800 dark:text-gray-300">Información del Asociado</span>
                            </div>
                        </div>
                        <div className="p-5 grid grid-cols-2 gap-4">
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-500 uppercase tracking-wider">Nombre Completo</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{asociado.DESC05}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-500 uppercase tracking-wider">Número de Cédula</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{asociado.NNIT05}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-500 uppercase tracking-wider">Número de Cuenta</p>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{asociado.NCTA05}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-500 uppercase tracking-wider">Nómina</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{asociado.DESC04}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Gestión */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="text-lg font-medium text-gray-800 dark:text-gray-300">Detalle de la Gestión</span>
                            </div>
                            <span className={`text-xs font-medium ${caracteresRestantes < 50 ? 'text-red-500' : 'text-gray-400'}`}>
                                {caracteresRestantes} caracteres restantes
                            </span>
                        </div>
                    </div>
                    <div className="p-5">
                        <textarea
                            value={gestion}
                            onChange={(e) => setGestion(e.target.value)}
                            rows={5}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white dark:focus:bg-gray-800 transition-all resize-none"
                            placeholder="Describa detalladamente la gestión realizada con el asociado..."
                            maxLength={MAX_CARACTERES}
                        />
                    </div>
                </div>
            </div>

            {/* Footer con borde superior */}
            <div className="bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-100 dark:border-gray-800 rounded-b-2xl">
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={guardarGestion}
                        disabled={!asociado || !gestion.trim() || gestion.length > MAX_CARACTERES || loading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm hover:shadow-md focus:ring-2 focus:ring-blue-500/20"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Guardando...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Guardar Gestión
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}