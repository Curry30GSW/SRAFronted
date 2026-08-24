import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Asociado {
  NCTA05: string;
  DIST05: string;
  DESC03: string;
  DESC05: string;
  DESC04: string;
  FECN05: string;
  NNIT05: string;
  CIUD05: string;
  BASE05: string;
  FRDA05: string;
  MORE05: string;
  TCEL05?: string;
  TCE205?: string;
  TCE305?: string;
  WHA105?:string;
  WHA205?:string;
  WHA305?: string;
}

// Función para formatear los datos para Excel
const formatDataForExcel = (asociados: Asociado[]) => {
  return asociados.map((asociado, index) => {
    const salario = parseFloat(asociado.BASE05) || 0;
    let segmento = 'Bronce';
    if (salario >= 5000000) segmento = 'Oro';
    else if (salario >= 3500000) segmento = 'Plata';

    return {
      '#': index + 1,
      'Agencia': `${asociado.DIST05} - ${asociado.DESC03 || ''}`,
      'Edad':  calcularEdad(asociado.FECN05),
      'Nombres': asociado.DESC05 || '',
      'Cédula': formatNumberWithDots(asociado.NNIT05),
      'Ciudad': asociado.CIUD05 || '',
      'Teléfono': getTelefonos(asociado),
      'Nómina': asociado.DESC04 || '',
      'Motivo Retiro': getMotivoRetiro(asociado.MORE05),
      'Fecha Retiro': formatFechaAs(asociado.FRDA05),
      'Salario': formatSalario(asociado.BASE05),
      'Clasificación': segmento,
    };
  });
};

// Funciones auxiliares (copia las que ya tienes en tu componente)
const formatNumberWithDots = (value: string | number): string => {
  if (!value) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('es-CO');
};


const calcularEdad = (fechaNacimiento: string):number|string => {
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
}


const getTelefonos = (asociado: Asociado): string => {
    const telefonos: string[] = [];
    
    // Función auxiliar para validar si el teléfono es válido
    const isValidPhone = (phone: string | undefined): boolean => {
        return !!phone && phone !== '0' && phone.trim() !== '';
    };
    
    // Agregar WhatsApp si existe y es válido
    if (isValidPhone(asociado.WHA105)) {
        telefonos.push(`WPP: ${asociado.WHA105}`);
    }
    
    if (isValidPhone(asociado.WHA205)) {
        telefonos.push(`WPP2: ${asociado.WHA205}`);
    }
    
    if (isValidPhone(asociado.WHA305)) {
        telefonos.push(`WPP3: ${asociado.WHA305}`);
    }

    // Agregar teléfono celular si existe y es válido
    if (isValidPhone(asociado.TCEL05)) {
        telefonos.push(`CEL: ${asociado.TCEL05}`);
    }
    
    // Agregar otros teléfonos si existen
    if (isValidPhone(asociado.TCE205)) {
        telefonos.push(`CEL2: ${asociado.TCE205}`);
    }
    
    if (isValidPhone(asociado.TCE305)) {
        telefonos.push(`CEL3: ${asociado.TCE305}`);
    }
    
    return telefonos.length > 0 ? telefonos.join(' - ') : 'N/A';
};

const getMotivoRetiro = (codigo: string): string => {
  const motivos: Record<string, string> = {
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
  return motivos[codigo] || codigo || 'No especificado';
};


const formatFechaAs = (fecha: string): string => {
    if (!fecha || fecha.length !== 7) return '';

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const siglo = parseInt(fecha.charAt(0)); 
    const año = parseInt(fecha.substring(1, 3)); 
    const mes = parseInt(fecha.substring(3, 5)) - 1; 
    const dia = fecha.substring(5, 7); 
    const añoCompleto = 1900 + (siglo * 100) + año;

    return `${dia} ${meses[mes]} ${añoCompleto}`;
};


const formatSalario = (salario: string | number): string => {
  if (!salario) return '$0';
  const num = typeof salario === 'string' ? parseFloat(salario) : salario;
  return `$${num.toLocaleString('es-CO')}`;
};

// Función principal de exportación
export const exportToExcel = (asociados: Asociado[], nombreArchivo: string = 'asociados_retirados') => {
  if (!asociados || asociados.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  try {
    // Formatear los datos
    const datosFormateados = formatDataForExcel(asociados);
    
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(datosFormateados);
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 6 },  // #
      { wch: 25 }, // Agencia
      {wch:12}, //Edad
      { wch: 40 }, // Nombres
      { wch: 18 }, // Cédula
      { wch: 18 }, // Ciudad
      { wch: 18 }, // Teléfono
      { wch: 50 }, // Nómina
      { wch: 25 }, // Motivo Retiro
      { wch: 18 }, // Fecha Retiro
      { wch: 18 }, // Salario
      { wch: 18 }, // Clasificación
    ];
    ws['!cols'] = colWidths;
    
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Asociados');
    
    // Generar archivo
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Crear blob y descargar
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    
    // Nombre del archivo con fecha
    const fecha = new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');
    
    saveAs(blob, `${nombreArchivo}_${fecha}.xlsx`);
    
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    alert('Ocurrió un error al exportar los datos. Por favor, intenta nuevamente.');
  }
};

// Función para exportar con filtros aplicados
export const exportWithFilters = (
  datosOriginales: Asociado[],
  datosFiltrados: Asociado[],
  filtrosAplicados: boolean = false,
  nombreArchivo: string = 'asociados_retirados'
) => {
  const datosAExportar = filtrosAplicados && datosFiltrados.length > 0 
    ? datosFiltrados 
    : datosOriginales;
  
  const nombreConSufijo = filtrosAplicados && datosFiltrados.length > 0 
    ? `${nombreArchivo}_filtrados` 
    : nombreArchivo;
  
  exportToExcel(datosAExportar, nombreConSufijo);
};