import React, { useState } from 'react';
import { getExportData } from '@/services/exportService';
import { exportToExcel } from '@/utils/exportExcel';

interface ExportExcelButtonProps {
    filtros: {
        search?: string;
        distrito?: string;
        motivo?: string;
        salarioMin?: string;
        salarioMax?: string;
        segmento?: string;
        sortBy?: string;
        sortOrder?: string;
    };

    datosOriginales: any[];
    datosFiltrados: any[];
    filtrosActivos: boolean;
    nombreArchivo?: string;
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    exportMethod?: 'frontend' | 'backend',
}

export const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({
    filtros = {},
    datosOriginales,
    datosFiltrados,
    filtrosActivos,
    nombreArchivo = 'asociados_retirados',
    className = '',
    variant = 'primary',
    size = 'md',
    disabled = false

}) => {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await getExportData(filtros);

            if (!response.success || !response.data || response.data.length === 0) {
                alert('No hay datos para exportar');
                setIsExporting(false);
                return;
            }

            const nombreConFiltros = filtrosActivos
                ? `${nombreArchivo}_filtrados`
                : nombreArchivo;

            //  Usamos tu función exportToExcel de utils
            exportToExcel(response.data, nombreConFiltros);

        } catch (error) {
            console.error('Error al exportar:', error);
        } finally {
            setTimeout(() => {
                setIsExporting(false);
            }, 1000)
        }
    };

    // Estilos según variante
    const getButtonStyles = () => {
        const baseStyles = 'flex items-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
        };

        const variants = {
            primary: 'bg-gradient-to-r from-green-600 to-emerald-600 text-gray-700 font-bold hover:from-green-700 hover:to-emerald-700 shadow-md shadow-green-600/30 hover:shadow-lg hover:shadow-green-600/40',
            secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
            outline: 'border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20',
        };

        return `${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`;
    };

    return (
        <button
            onClick={handleExport}
            disabled={disabled || isExporting || datosOriginales.length === 0}
            className={getButtonStyles()}
            title={datosOriginales.length === 0 ? 'No hay datos para exportar' : ''}
        >
            {isExporting ? (
                <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exportando...
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar Excel
                    {filtrosActivos && datosFiltrados.length > 0 && datosFiltrados.length < datosOriginales.length && (
                        <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            {datosFiltrados.length} registros
                        </span>
                    )}
                </>
            )}
        </button>
    );
};