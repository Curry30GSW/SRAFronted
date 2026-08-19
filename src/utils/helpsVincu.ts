

/**
 * Parsear teléfonos desde JSON string
 */
export const parseTelefonos = (telefonosStr: string): string[] => {
    try {
        return JSON.parse(telefonosStr);
    } catch {
        return [];
    }
};

/**
 * Obtener teléfonos formateados
 */
export const getTelefonosVinculacion = (vinculacion: any): string => {
    const telefonos = parseTelefonos(vinculacion.telefonos || '[]');
    return telefonos.join(', ') || 'No registra';
};

/**
 * Formatear fecha
 */
export const formatFecha = (fecha: string): string => {
    if (!fecha) return 'N/A';
    
    const date = new Date(fecha);
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    
    return `${dia} ${mes} ${año}`;
};

/**
 * Formatear fecha con hora
 */
export const formatFechaHora = (fecha: string): string => {
    if (!fecha) return 'N/A';
    
    const date = new Date(fecha);
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    
    // Formatear hora (12 horas con AM/PM)
    let horas = date.getHours();
    const minutos = String(date.getMinutes()).padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12 || 12; // Convertir a formato 12h
    
    return `${dia} ${mes} ${año} - ${horas}:${minutos} ${ampm}`;
};

/**
 * Obtener badge de estado
 */
export const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { color: string; label: string }> = {
        'PENDIENTE': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pendiente' },
        'APROBADO': { color: 'bg-green-100 text-green-800 border-green-300', label: 'Aprobado' },
        'RECHAZADO': { color: 'bg-red-100 text-red-800 border-red-300', label: 'Rechazado' },
        'EN_REVISION': { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'En Revisión' },
    };
    return estados[estado] || { color: 'bg-gray-100 text-gray-800 border-gray-300', label: estado };
};

/**
 * Obtener etiqueta de tipo de trabajador
 */
export const getTipoTrabajadorLabel = (tipo: string | null): string => {
    if (!tipo) return 'No especificado';
    const tipos: Record<string, string> = {
        'EMPLEADO': 'Empleado',
        'PENSIONADO': 'Pensionado'
    };
    return tipos[tipo] || tipo;
};

/**
 * Obtener etiqueta de sector empresa
 */
export const getSectorEmpresaLabel = (sector: string | null): string => {
    if (!sector) return 'N/A';
    const sectores: Record<string, string> = {
        'PUBLICO': 'Público',
        'PRIVADO': 'Privado',
        'MIXTO': 'Mixto'
    };
    return sectores[sector] || sector;
};

/**
 * Formatear número con puntos
 */
export const formatNumberWithDots = (num: string | number): string => {
    const str = String(num);
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};