

/**
 * Parsear teléfonos desde JSON string
 */
export const parseTelefonos = (telefonos: any): string[] => {
    if (!telefonos) return [];
    
    if (Array.isArray(telefonos)) return telefonos;
    
    if (typeof telefonos === 'string') {
        // Si es un JSON string
        try {
            const parsed = JSON.parse(telefonos);
            if (Array.isArray(parsed)) return parsed;
        } catch {}
        
        // Si tiene comas
        if (telefonos.includes(',')) {
            return telefonos.split(',').map(t => t.trim()).filter(t => t);
        }
        
        return [telefonos];
    }
    
    return [];
};

export const formatTelefonos = (telefonos: any, separator: string = ' - '): string => {
    const arr = parseTelefonos(telefonos);
    if (arr.length === 0) return 'No registra';
    return arr.join(separator);
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
    const configs: Record<string, { color: string; label: string }> = {
        'PENDIENTE': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', label: 'Pendiente' },
        'EN_REVISION': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', label: 'En Revisión' },
        'APROBADO': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Aprobado' },
        'RECHAZADO': { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Rechazado' },
        'DESISTIMIENTO': { color: 'bg-red-100 text-red-800 dark:bg-red-700/30 dark:text-red-300', label: 'Desistimiento' },
        'CAPACIDAD_PAGO_NEGATIVA': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', label: 'Capacidad de pago negativa' },
        'SCORE_BAJO': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', label: 'Score bajo' },
        'EMBARGO': { color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300', label: 'Embargo' },
        'EMPRESA_PRIVADA': { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', label: 'Empresa privada' },
        'PENDIENTE_DATACREDITO': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', label: 'Pendiente Datacrédito' },
        'EN_TRAMITE': { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'En trámite - Fase 2' },
    };
    return configs[estado] || configs['PENDIENTE'];
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


export const calcularEdad = (fechaNacimiento: string | null | undefined): number | null => {
    if (!fechaNacimiento) return null;
    
    try {
        const fechaNac = new Date(fechaNacimiento);
        // Verificar si la fecha es válida
        if (isNaN(fechaNac.getTime())) return null;
        
        const hoy = new Date();
        
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mesActual = hoy.getMonth();
        const diaActual = hoy.getDate();
        const mesNac = fechaNac.getMonth();
        const diaNac = fechaNac.getDate();
        
        // Si aún no ha cumplido años este año
        if (mesActual < mesNac || (mesActual === mesNac && diaActual < diaNac)) {
            edad--;
        }
        
        return edad;
    } catch {
        return null;
    }
};


export const getEstadoLabel = (estado: string): string => {

    const configs: Record<string, string> = {
        'PENDIENTE': 'PENDIENTE',
        'EN_REVISION': 'EN REVISIÓN',
        'APROBADO': 'APROBADO',
        'RECHAZADO': 'RECHAZADO',
        'DESISTIMIENTO': 'DESISTIMIENTO',
        'CAPACIDAD_PAGO_NEGATIVA': 'CAPACIDAD DE PAGO NEGATIVA',
        'SCORE_BAJO': 'SCORE BAJO',
        'EMBARGO': 'EMBARGO',
        'EMPRESA_PRIVADA': 'EMPRESA PRIVADA',
        'PENDIENTE_DATACREDITO': 'PENDIENTE CONSULTA DATACRÉDITO',
        'EN_TRAMITE': 'EN TRÁMITE - FASE 2',
    };

    return configs[estado] || estado;
};

// ✅ Verificar si el estado es final (no permite cambios)
export const esEstadoFinal = (estado: string): boolean => {
    const estadosFinales = [
        'DESISTIMIENTO',
        'CAPACIDAD_PAGO_NEGATIVA',
        'EMBARGO',
        'EMPRESA_PRIVADA',
        'SCORE_BAJO',
        'RECHAZADO',
        'APROBADO'
    ];
    return estadosFinales.includes(estado);
};
