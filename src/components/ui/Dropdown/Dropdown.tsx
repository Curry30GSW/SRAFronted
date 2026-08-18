import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLElement | null>;
    children: React.ReactNode;
    className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
    isOpen,
    onClose,
    triggerRef,
    children,
    className = "",
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const [isPositioned, setIsPositioned] = useState(false);

    const updatePosition = () => {
        if (!triggerRef.current || !dropdownRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();

        // Verificar que las dimensiones sean válidas
        if (rect.width === 0 || rect.height === 0) return;

        const espacioAbajo = window.innerHeight - rect.bottom;
        const espacioArriba = rect.top;

        // Determinar si abrir hacia arriba o abajo
        const abrirArriba = espacioAbajo < dropdownRect.height && espacioArriba > dropdownRect.height;

        const top = abrirArriba
            ? rect.top - dropdownRect.height
            : rect.bottom;

        // Ajustar si se sale de la pantalla a la izquierda
        let left = rect.left;
        if (left + dropdownRect.width > window.innerWidth) {
            left = window.innerWidth - dropdownRect.width - 10;
        }

        // Asegurar que no se salga por la izquierda
        if (left < 0) left = 10;

        setStyle({
            position: "fixed",
            top,
            left,
            minWidth: Math.max(rect.width, 200),
            zIndex: 1000,
        });

        setIsPositioned(true);
    };

    // Efecto principal cuando se abre
    useEffect(() => {
        if (!isOpen) {
            setIsPositioned(false);
            return;
        }

        //  PRIMERO: Intentar posicionar inmediatamente
        updatePosition();

        //  SEGUNDO: Forzar re-posicionamiento después de un breve delay
        // Esto asegura que el DOM esté completamente renderizado
        const timer1 = setTimeout(() => {
            updatePosition();
        }, 10);

        const timer2 = setTimeout(() => {
            updatePosition();
        }, 50);

        //  TERCERO: Re-posicionar en eventos críticos
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen]);

    // Efecto para manejar click fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !triggerRef.current?.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose, triggerRef]);

    if (!isOpen) return null;

    return createPortal(
        <div
            ref={dropdownRef}
            style={style}
            className={`rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900 min-w-[200px] transition-opacity duration-150 ${isPositioned ? "opacity-100" : "opacity-0"} ${className}`}
        >
            {children}
        </div>,
        document.body
    );
};