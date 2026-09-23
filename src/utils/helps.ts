interface Asociado {
    WHA105?: string;
    TCEL05?: string;
    TCE205?: string;
    TCE305?: string;
    WHA205?: string;
    WHA305?: string;
    [key: string]: any; // Para otros campos
}

export const formatFecha = (fecha: string) => {
    if (!fecha || fecha.length !== 7) return '';

    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    // Extraer componentes
    const siglo = parseInt(fecha.charAt(0)); 
    const año = parseInt(fecha.substring(1, 3)); 
    const mes = parseInt(fecha.substring(3, 5)) - 1; 
    const dia = fecha.substring(5, 7); 


    // Calcular año completo
    const añoCompleto = 1900 + (siglo * 100) + año;
    // Si siglo = 1 → 1900 + 100 + 25 = 2025

    return `${dia} ${meses[mes]} ${añoCompleto}`;
};

export const formatSalario = (salario: string) => {
        const num = parseFloat(salario)
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num)
    };

//FORMATEAR CEDULA
export const formatNumberWithDots = (number: number | string) => {
    if (!number) return '';
    const numStr = number.toString();
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return parts.join('.');
};


//FORMATEAR TELEFONO EN CASO QUE SEAN VARIOS.
export const getTelefonos = (asociado: Asociado): string => {
    // ✅ Set para evitar duplicados
    const telefonosSet = new Set<string>();

    // Función auxiliar para validar si el teléfono es válido
    const isValidPhone = (phone: string | undefined): boolean => {
        return !!phone && phone !== '0' && phone.trim() !== '';
    };

    // Función auxiliar para agregar solo si es válido y no está repetido
    const addPhone = (phone: string | undefined) => {
        if (isValidPhone(phone)) {
            telefonosSet.add(phone!.trim());
        }
    };

    // Agregar en el orden deseado
    addPhone(asociado.WHA105);
    addPhone(asociado.TCEL05);
    addPhone(asociado.TCE205);
    addPhone(asociado.TCE305);
    addPhone(asociado.WHA205);
    addPhone(asociado.WHA305);

    return telefonosSet.size > 0 ? Array.from(telefonosSet).join(' - ') : 'No tiene registrado';
};


// Mapa de códigos de motivo de retiro
const MOTIVOS_RETIRO: Record<string, string> = {
    '01': 'Adquirió crédito con otra entidad',
    '04': 'Convenio Cancelado',
    '15': 'Cruce Forzoso por retiro del cargo',
    '17': 'Capacidad de pago negativa',
    '19': 'Jubilado',
    '20': 'Embargo',
    '26': 'Excluido',
    '28': 'Licencia no remunerada',
    '32': 'Tabulado Falso',
    '51': 'Incapacidad Permanente',
    '58': 'Mala atención',
    '66': 'Nuestros servicios no le satisfacen',
    '67': 'Otras obligaciones',
    '68': 'Retiro del cargo',
    '75': 'Pensión compartida',
    '81': 'Supersolidaria',
    '82': 'Fraude falsificación documentos',
    '83': 'Cambio de nombre ley 1260 de 1970'
};

/**
 * Obtiene el motivo de retiro a partir del código
 * @param codigo - Código del motivo (ej: '66')
 * @returns Motivo de retiro formateado
 */
export const getMotivoRetiro = (codigo: string | undefined): string => {
    if (!codigo) return 'N/A';
    return MOTIVOS_RETIRO[codigo] || `Código ${codigo} (Sin descripción)`;
};

export const calcularEdad = (fechaNacimiento: string):number|string => {
        if (!fechaNacimiento || fechaNacimiento === '0' || fechaNacimiento === '') {
            return 'No disponible'
        }

        // El formato es AAAAMMDD (ej: 19470307)
        const año = parseInt(fechaNacimiento.substring(0, 4))
        const mes = parseInt(fechaNacimiento.substring(4, 6)) - 1 // Meses empiezan en 0
        const dia = parseInt(fechaNacimiento.substring(6, 8))

        const fechaNac = new Date(año, mes, dia)
        const hoy = new Date()

        let edad = hoy.getFullYear() - fechaNac.getFullYear()
        const mesActual = hoy.getMonth()
        const diaActual = hoy.getDate()

        // Si aún no ha cumplido años este año
        if (mesActual < mes || (mesActual === mes && diaActual < dia)) {
            edad--
        }

        return edad
};

export const getEdadColor = (fechaNacimiento: string) => {
     const edad = calcularEdad(fechaNacimiento)
        if(typeof edad === "string"){
            return 'blue'
        }

        if(edad >= 75) {
             return 'text-red-600 dark:text-red-400 font-bold'
        }


};