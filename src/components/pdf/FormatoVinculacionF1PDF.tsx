import jsPDF from 'jspdf';
import { Vinculacion } from '../../types/Vinculacion';
import { formatFecha, formatFechaHora, getTipoTrabajadorLabel } from '../../utils/helpsVincu';

const COLORS = {
    green: '#008f70',
    darkGreen: '#145044',
    gold: '#e9a52b',
    ink: '#263b38',
    muted: '#0e0d0d',
    lightGreen: '#eaf6f2',
    line: '#d8e4e0',
    white: '#ffffff',
    okGreen: '#1f8a5f',
    warnRed: '#b5462f',
    red: '#c62828',
};

const MARGIN = 12;
const HEADER_HEIGHT = 34;

type Field = { label: string; value: string; ok?: boolean; isBadge?: boolean };

const loadLogo = async (): Promise<string | null> => {
    try {
        const basePath = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
        const logoPath = `${basePath}/images/logo/coopserp.png`;

        const response = await fetch(logoPath);
        if (!response.ok) return null;
        const blob = await response.blob();
        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};

const textValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return 'No registrado';
    return String(value);
};

// Dibuja una etiqueta + valor en (x, y) y devuelve el punto más bajo que ocupó
const drawField = (doc: jsPDF, field: Field, x: number, y: number, width: number): number => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.3);
    doc.setTextColor(COLORS.muted);
    doc.text(field.label.toUpperCase(), x, y);

    doc.setFont('helvetica', field.isBadge ? 'bold' : 'normal');
    doc.setFontSize(10.2);
    if (field.isBadge) {
        doc.setTextColor(field.ok ? COLORS.okGreen : COLORS.warnRed);
    } else {
        doc.setTextColor(COLORS.ink);
    }

    const lines = doc.splitTextToSize(field.value, width - 1);
    doc.text(lines, x, y + 6);

    return y + 6 + (lines.length - 1) * 3.4 + 3.5;
};

// Distribuye una lista de campos en filas de 3 columnas y devuelve el nuevo yPos
const drawFieldsGrid = (doc: jsPDF, fields: Field[], startY: number, pageWidth: number): number => {
    const cols = 3;
    const gutter = 4;
    const colWidth = (pageWidth - MARGIN * 2 - gutter * (cols - 1)) / cols;

    let rowY = startY;
    let rowBottom = startY;

    fields.forEach((field, i) => {
        const col = i % cols;
        if (col === 0 && i !== 0) {
            rowY = rowBottom + 3;
            rowBottom = rowY;
        }
        const x = MARGIN + col * (colWidth + gutter);
        const bottom = drawField(doc, field, x, rowY, colWidth);
        if (bottom > rowBottom) rowBottom = bottom;
    });

    return rowBottom + 2;
};

const drawSectionTitle = (doc: jsPDF, title: string, number: string, y: number, pageWidth: number): number => {
    doc.setFillColor(COLORS.lightGreen);
    doc.roundedRect(MARGIN, y - 4, pageWidth - MARGIN * 2, 7, 1.2, 1.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(COLORS.darkGreen);
    doc.text(`${number}  ${title.toUpperCase()}`, MARGIN + 3, y + 0.8);
    return y + 7;
};

const drawHeader = (
    doc: jsPDF,
    logo: string | null,
    tipo: string,
    idSolicitante: number,
    fechaCreacion: string,
    lugarProcedencia: string
) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(COLORS.white);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

    // ===== LOGO =====
    if (logo) {
        doc.addImage(logo, 'PNG', MARGIN, 3, 65, 25);
    } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.setTextColor(COLORS.green);
        doc.text('COOPSERP', MARGIN, 14);
    }

    // ===== F1 No. GRANDE Y ROJO =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(COLORS.red);
    doc.text(`F1 No. ${idSolicitante}`, pageWidth - MARGIN, 9, { align: 'right' });

    // ===== FORMATO DE VINCULACIÓN (más pequeño, arriba del F1) =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.darkGreen);
    doc.text('FORMATO DE VINCULACIÓN VIRTUAL', pageWidth - MARGIN, 16, { align: 'right' });

    // ===== FECHA DE SOLICITUD =====
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted);
    doc.text(`Fecha de solicitud: ${fechaCreacion}`, pageWidth - MARGIN, 21, { align: 'right' });

    // ===== LUGAR DE PROCEDENCIA =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.darkGreen);
    doc.text(`Lugar Procedencia: ${lugarProcedencia}`, pageWidth - MARGIN, 26, { align: 'right' });

    // Línea decorativa
    doc.setDrawColor(COLORS.gold);
    doc.setLineWidth(1);
    doc.line(MARGIN, HEADER_HEIGHT, pageWidth - MARGIN, HEADER_HEIGHT);

    // ===== TIPO DE SOLICITUD (abajo a la izquierda) =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(COLORS.muted);
    const tituloSolicitud = tipo === 'ASOCIADO' ? 'SOLICITUD ASOCIACIÓN' : 'ACTUALIZACIÓN DE DATOS';
    doc.text(tituloSolicitud, pageWidth / 2, HEADER_HEIGHT + 6, { align: 'center' });

};

const drawFooter = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(COLORS.line);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, pageHeight - 10, pageWidth - MARGIN, pageHeight - 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.3);
    doc.setTextColor(COLORS.muted);
    doc.text('Documento generado electrónicamente por Coopserp', MARGIN, pageHeight - 5);
};

export const generarPDFVinculacion = async (
    vinculacion: Vinculacion,
    tipo: 'ASOCIADO' | 'ACTUALIZACION' = 'ASOCIADO'
) => {
    const doc = new jsPDF('p', 'mm', 'letter');
    const logo = await loadLogo();
    const pageWidth = doc.internal.pageSize.getWidth();
    const title =
        tipo === 'ASOCIADO'
            ? 'SOLICITUD VINCULACION'
            : 'ACTUALIZACION DATOS ASOCIADO';

    doc.setProperties({ title, subject: 'Formato F1 de vinculación virtual', author: 'Coopserp' });

    // ===== HEADER MODIFICADO =====
    drawHeader(
        doc,
        logo,
        tipo,
        vinculacion.id_solicitante,
        formatFechaHora(vinculacion.fecha_creacion),
        textValue(vinculacion.lugar_procedencia)
    );

    let yPos = HEADER_HEIGHT + 8;

    yPos += 9;


    // 01 · Datos personales
    yPos = drawSectionTitle(doc, 'Datos personales', '01', yPos, pageWidth);
    yPos += 3;
    yPos = drawFieldsGrid(
        doc,
        [
            { label: 'Tipo de documento', value: textValue(vinculacion.tipo_documento) },
            { label: 'Número de documento', value: textValue(vinculacion.numero_documento) },
            { label: 'Lugar de expedición', value: textValue(vinculacion.lugar_expedicion) },
            { label: 'Fecha de expedición', value: formatFecha(vinculacion.fecha_expedicion) },
            {
                label: 'Nombres y apellidos',
                value: `${textValue(vinculacion.nombres)} ${textValue(vinculacion.apellidos)}`,
            },
            { label: 'Fecha de nacimiento', value: formatFecha(vinculacion.fecha_nacimiento) },
            { label: 'Lugar de nacimiento', value: textValue(vinculacion.lugar_nacimiento) },
        ],
        yPos,
        pageWidth
    );
    yPos += 9;

    // 02 · Residencia y correspondencia
    yPos = drawSectionTitle(doc, 'Residencia y correspondencia', '02', yPos, pageWidth);
    yPos += 3;
    yPos = drawFieldsGrid(
        doc,
        [
            { label: 'Ciudad de residencia', value: textValue(vinculacion.ciudad_residencia) },
            { label: 'Dirección de residencia', value: textValue(vinculacion.direccion_residencia) },
            { label: 'Ciudad de correspondencia', value: textValue(vinculacion.ciudad_correspondencia) },
            { label: 'Dirección de correspondencia', value: textValue(vinculacion.direccion_correspondencia) },
        ],
        yPos,
        pageWidth
    );
    yPos += 9;

    // 03 · Información laboral
    const laboralFields: Field[] = [
        {
            label: 'Tipo de trabajador',
            value: vinculacion.tipo_trabajador ? getTipoTrabajadorLabel(vinculacion.tipo_trabajador) : 'No registrado',
        },
    ];
    if (vinculacion.tipo_trabajador === 'EMPLEADO') {
        laboralFields.push(
            { label: 'Empresa', value: textValue(vinculacion.empresa) },
            { label: 'Cargo', value: textValue(vinculacion.cargo) },
            { label: 'Sector de la empresa', value: textValue(vinculacion.sector_empresa) },
            { label: 'Tiempo en el cargo', value: textValue(vinculacion.tiempo_cargo) }
        );
    }
    if (vinculacion.tipo_trabajador === 'PENSIONADO') {
        laboralFields.push({ label: 'Pagaduría', value: textValue(vinculacion.pagaduria) });
    }
    yPos = drawSectionTitle(doc, 'Información laboral', '03', yPos, pageWidth);
    yPos += 3;
    yPos = drawFieldsGrid(doc, laboralFields, yPos, pageWidth);
    yPos += 9;

    // 04 · Datos de contacto
    yPos = drawSectionTitle(doc, 'Datos de contacto', '04', yPos, pageWidth);
    yPos += 3;
    yPos = drawFieldsGrid(
        doc,
        [
            { label: 'Correo electrónico', value: textValue(vinculacion.correo_electronico) },
            { label: 'Teléfonos', value: textValue(vinculacion.telefonos) },
            { label: 'WhatsApp', value: textValue(vinculacion.whatsapp) },
        ],
        yPos,
        pageWidth
    );
    yPos += 9;

    // 05 · Autorizaciones (sin firmas, solo constancia de lo autorizado en la solicitud virtual)
    yPos = drawSectionTitle(doc, 'Autorizaciones del solicitante', '05', yPos, pageWidth);
    yPos += 3;
    yPos = drawFieldsGrid(
        doc,
        [
            {
                label: 'Consulta en centrales de riesgo',
                value: vinculacion.central_riesgos ? 'Autorizado' : 'No autorizado',
                ok: !!vinculacion.central_riesgos,
                isBadge: true,
            },
            {
                label: 'Tratamiento de datos personales',
                value: vinculacion.tratamiento_datos ? 'Autorizado' : 'No autorizado',
                ok: !!vinculacion.tratamiento_datos,
                isBadge: true,
            },
            {
                label: 'Apertura de cuenta Coopserp',
                value: vinculacion.apertura_coopserp ? 'Autorizado' : 'No autorizado',
                ok: !!vinculacion.apertura_coopserp,
                isBadge: true,
            },
        ],
        yPos,
        pageWidth
    );

    drawFooter(doc);

    const fileName = `F1_${textValue(vinculacion.numero_documento)}_${textValue(vinculacion.nombres).replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
};