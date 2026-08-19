import React from 'react';
import { Input } from '../ui/Input';

interface FiltrosVinculacionProps {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    filtroEstado: string;
    setFiltroEstado: (value: string) => void;
    filtroTipoDocumento: string;
    setFiltroTipoDocumento: (value: string) => void;
    filtroFechaInicio: string;
    setFiltroFechaInicio: (value: string) => void;
    filtroFechaFin: string;
    setFiltroFechaFin: (value: string) => void;
    limpiarFiltros: () => void;
}

export const FiltrosVinculacion: React.FC<FiltrosVinculacionProps> = ({
    searchTerm,
    setSearchTerm,
    filtroEstado,
    setFiltroEstado,
    filtroTipoDocumento,
    setFiltroTipoDocumento,
    filtroFechaInicio,
    setFiltroFechaInicio,
    filtroFechaFin,
    setFiltroFechaFin,
    limpiarFiltros
}) => {
    return (
        <div className="bg-white dark:bg-orbit-surface2/30 rounded-lg border border-gray-200 dark:border-orbit-border p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Búsqueda por nombre o cédula */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Buscar
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Nombre o cédula..."
                        className="w-full h-9 rounded-lg border border-gray-300 dark:border-orbit-border bg-white dark:bg-orbit-surface2 px-3 text-sm text-gray-900 dark:text-slate-200 focus:border-orbit-primary focus:ring-1 focus:ring-orbit-primary/30 outline-none"
                    />
                </div>

                {/* Filtro por Estado */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Estado
                    </label>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-300 dark:border-orbit-border bg-white dark:bg-orbit-surface2 px-3 text-sm text-gray-900 dark:text-slate-200 focus:border-orbit-primary focus:ring-1 focus:ring-orbit-primary/30 outline-none"
                    >
                        <option value="">Todos</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="APROBADO">Aprobado</option>
                        <option value="RECHAZADO">Rechazado</option>
                        <option value="EN_REVISION">En Revisión</option>
                    </select>
                </div>

                {/* Filtro por Tipo de Documento */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                        Tipo Documento
                    </label>
                    <select
                        value={filtroTipoDocumento}
                        onChange={(e) => setFiltroTipoDocumento(e.target.value)}
                        className="w-full h-9 rounded-lg border border-gray-300 dark:border-orbit-border bg-white dark:bg-orbit-surface2 px-3 text-sm text-gray-900 dark:text-slate-200 focus:border-orbit-primary focus:ring-1 focus:ring-orbit-primary/30 outline-none"
                    >
                        <option value="">Todos</option>
                        <option value="CC">Cédula Ciudadanía</option>
                        <option value="CE">Cédula Extranjería</option>
                        <option value="NIT">NIT</option>
                    </select>
                </div>

                {/* Rango de Fechas */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Desde
                        </label>
                        <input
                            type="date"
                            value={filtroFechaInicio}
                            onChange={(e) => setFiltroFechaInicio(e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-300 dark:border-orbit-border bg-white dark:bg-orbit-surface2 px-3 text-sm text-gray-900 dark:text-slate-200 focus:border-orbit-primary focus:ring-1 focus:ring-orbit-primary/30 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                            Hasta
                        </label>
                        <input
                            type="date"
                            value={filtroFechaFin}
                            onChange={(e) => setFiltroFechaFin(e.target.value)}
                            className="w-full h-9 rounded-lg border border-gray-300 dark:border-orbit-border bg-white dark:bg-orbit-surface2 px-3 text-sm text-gray-900 dark:text-slate-200 focus:border-orbit-primary focus:ring-1 focus:ring-orbit-primary/30 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-orbit-border">
                <button
                    onClick={limpiarFiltros}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-orbit-surface2 border border-gray-300 dark:border-orbit-border rounded-lg hover:bg-gray-50 dark:hover:bg-orbit-surface3 transition-colors"
                >
                    Limpiar filtros
                </button>
            </div>
        </div>
    );
};