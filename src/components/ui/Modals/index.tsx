import { forwardRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    className?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
    isFullscreen?: boolean;
    size?: "sm" | "md" | "lg" | "xl" | "xxl";
    creditos?: unknown[];
    title?: React.ReactNode;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(({
    isOpen,
    onClose,
    children,
    className = "",
    isFullscreen = false,
    size = "md",
    title
}, ref) => {
    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-3xl",
        xl: "max-w-5xl",
        xxl: "max-w-8xl"
    };

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            document.body.style.position = "";
            document.body.style.width = "";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
            document.body.style.position = "";
            document.body.style.width = "";
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[1040] flex items-center justify-center p-4"
                    aria-modal="true"
                    role="dialog"
                >
                    {/* Fondo */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        transition={{ duration: 0.15 }}
                        style={{ zIndex: 999998 }}
                    />

                    {/* Contenedor del modal */}
                    <motion.div
                        ref={ref}
                        className={`relative ${isFullscreen
                                ? "w-full h-full"
                                : `w-full ${sizeClasses[size]}`
                            } bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden ${className}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{
                            duration: 0.2,
                            ease: "easeOut"
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ zIndex: 999999 }}
                    >
                        {/* ✅ Título y botón cerrar DENTRO del modal */}
                        {title && (
                            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
                                    aria-label="Cerrar"
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {/* Contenido */}
                        <div className="max-h-[90vh] overflow-y-auto p-6">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
});