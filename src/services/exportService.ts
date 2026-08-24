import { FetchDynamic } from "@/components/Api/FetchDynamic";

interface ExportFilters {
    search?: string;
    distrito?: string;
    motivo?: string;
    salarioMin?: string;
    salarioMax?: string;
    segmento?: string;
    sortBy?: string;
    sortOrder?: string;
}


export const getExportData = async (filters: ExportFilters) => {
    try {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '' && value !== 'todos') {
                params.append(key, value);
            }
        });

        const url = `/asociados/export?${params.toString()}`;
        const response = await FetchDynamic(url);
        
        if (!response.ok) {
            throw new Error('Error al obtener datos para exportación');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en getExportData:', error);
        throw error;
    }
};
