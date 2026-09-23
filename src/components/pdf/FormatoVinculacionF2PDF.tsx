import jsPDF from 'jspdf';

import { Fase2Item } from '@/types/VinculacionF2';
import { formatFecha, formatFechaHora } from '../../utils/helpsVincu';
import {
    formatNumberWithDots,
    calcularEdad
} from '../../utils/helpsVincu';

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
    neutralGray: '#7a8683',
    neutralGrayDark: '#5c6663',
};

const MARGIN = 12;
const HEADER_HEIGHT = 42;

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
const drawField = (
    doc: jsPDF,
    field: Field,
    x: number,
    y: number,
    width: number,
    showCheckbox: boolean = false
): number => {
    // Label (título)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.3);
    doc.setTextColor(COLORS.muted);
    doc.text(field.label.toUpperCase(), x, y);

    //  Si es badge y tiene checkbox
    if (field.isBadge && showCheckbox) {
        const checkboxSize = 3.5;
        const valueY = y + 6;
        const checkboxX = x;
        const checkboxY = valueY - checkboxSize + 0.7;

        // Cuadrado del checkbox
        doc.setDrawColor(COLORS.ink);
        doc.setLineWidth(0.3);
        doc.rect(checkboxX, checkboxY, checkboxSize, checkboxSize, 'S');

        // Si está autorizado, dibujar la marca ✓
        if (field.ok) {
            doc.setDrawColor(COLORS.okGreen);
            doc.setLineWidth(0.6);
            doc.line(checkboxX + 0.7, checkboxY + 1.8, checkboxX + 1.5, checkboxY + 2.7);
            doc.line(checkboxX + 1.5, checkboxY + 2.7, checkboxX + 3, checkboxY + 0.8);
        }

        // Texto del valor (Autorizado / No autorizado)
        doc.setFont('helvetica', field.isBadge ? 'bold' : 'normal');
        doc.setFontSize(10.2);
        doc.setTextColor(field.ok ? COLORS.okGreen : COLORS.warnRed);

        const lines = doc.splitTextToSize(field.value, width - checkboxSize - 3);
        doc.text(lines, x + checkboxSize + 2.5, valueY);

        return valueY + (lines.length - 1) * 3.4 + 3.5;
    }

    // Comportamiento normal (sin checkbox)
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
const drawFieldsGrid = (
    doc: jsPDF,
    fields: Field[],
    startY: number,
    pageWidth: number,
    showCheckbox: boolean = false
): number => {
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
        const bottom = drawField(doc, field, x, rowY, colWidth, showCheckbox);
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

// ===== BADGE DE AFILIADOR - DISEÑO DISCRETO =====
const drawAfiliadorBadge = (
    doc: jsPDF,
    pageWidth: number,
    hasAfiliador: boolean,
    afiliadorNombre: string,
    yPosition: number
) => {
    if (!hasAfiliador) {
        // Sin afiliador - texto sutil centrado
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(COLORS.neutralGray);
        doc.text('SOLICITUD ESPONTANEA', pageWidth / 2, yPosition, { align: 'center' });
        return;
    }

    // ===== Con afiliador - diseño dinámico =====
    const label = 'Gestionado por:';
    const name = afiliadorNombre.toUpperCase();

    // Calcular anchos de los textos
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const labelWidth = doc.getTextWidth(label);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const nameWidth = doc.getTextWidth(name);

    // Espaciado entre elementos
    const spacing = 4;
    const iconSize = 2;
    const totalWidth = labelWidth + spacing + nameWidth + spacing + iconSize;

    // Calcular posición X centrada
    const startX = (pageWidth - totalWidth) / 2;

    // Línea decorativa izquierda (dinámica según el ancho total)
    const leftLineEnd = startX - 8;
    const rightLineStart = startX + totalWidth + 8;

    doc.setDrawColor(COLORS.gold);
    doc.setLineWidth(0.3);

    // Líneas decorativas solo si hay espacio suficiente
    if (leftLineEnd > MARGIN + 10) {
        doc.line(MARGIN + 10, yPosition - 1, leftLineEnd, yPosition - 1);
    }
    if (rightLineStart < pageWidth - MARGIN - 10) {
        doc.line(rightLineStart, yPosition - 1, pageWidth - MARGIN - 10, yPosition - 1);
    }

    let currentX = startX;

    // Texto "Gestionado por:" (sutil)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.neutralGray);
    doc.text(label, currentX, yPosition);
    currentX += labelWidth + 2 + spacing;

    // Nombre del afiliador (destacado pero discreto)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(COLORS.darkGreen);
    doc.text(name, currentX, yPosition);
    currentX += nameWidth + spacing;

};

const drawHeader = (
    doc: jsPDF,
    logo: string | null,
    tipo: string,
    idSolicitante: number,
    fechaCreacion: string,
    lugarProcedencia: string,
    hasAfiliador: boolean,
    afiliadorNombre: string
) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(COLORS.white);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

    // ===== LOGO =====
    const logoWidth = 65;
    if (logo) {
        doc.addImage(logo, 'PNG', MARGIN, 3, logoWidth, 25);
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
    doc.text(`F2 No. ${idSolicitante}`, pageWidth - MARGIN, 9, { align: 'right' });

    // ===== FORMATO DE VINCULACIÓN =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(COLORS.darkGreen);
    doc.text('FORMATO 2 DE VINCULACIÓN VIRTUAL', pageWidth - MARGIN, 16, { align: 'right' });

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
    doc.line(MARGIN, 30, pageWidth - MARGIN, 30);

    // ===== TIPO DE SOLICITUD (centrado) =====
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(COLORS.muted);
    const tituloSolicitud = tipo === 'ASOCIADO' ? 'SOLICITUD ASOCIACIÓN F2' : 'ACTUALIZACIÓN DE DATOS';
    doc.text(tituloSolicitud, pageWidth / 2, 35, { align: 'center' });

    // ===== BADGE DE AFILIADOR (discreto, debajo del título) =====
    drawAfiliadorBadge(doc, pageWidth, hasAfiliador, afiliadorNombre, 40);
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
    doc.text('COOPSERP - v1.0', MARGIN, pageHeight - 5);
};

export const generarPDFVinculacionF2 = async (
    vinculacion: Fase2Item,
    tipo: 'ASOCIADO' | 'ACTUALIZACION' = 'ASOCIADO'
) => {
    const doc = new jsPDF('p', 'mm', 'letter');
    const logo = await loadLogo();
    const pageWidth = doc.internal.pageSize.getWidth();
    const title =
        tipo === 'ASOCIADO'
            ? 'SOLICITUD VINCULACION'
            : 'ACTUALIZACION DATOS ASOCIADO';
    doc.setProperties({ title, subject: 'Formato F2 de vinculación virtual', author: 'Coopserp' });

    const hasAfiliador = !!vinculacion.afiliador_nombre;
    const afiliadorDisplay = hasAfiliador
        ? `${vinculacion.afiliador_nombre}${vinculacion.afiliador_usuario ? ` (${vinculacion.afiliador_usuario})` : ''}`
        : '';

    // ===== HEADER =====
    drawHeader(
        doc,
        logo,
        tipo,
        vinculacion.id_fase2,
        formatFechaHora(vinculacion.fecha_creacion),
        textValue(vinculacion.lugar_procedencia),
        hasAfiliador,
        afiliadorDisplay
    );

    let yPos = HEADER_HEIGHT + 8;
    yPos += 9;



    // 01 · Datos personales
    yPos = drawSectionTitle(doc, 'Datos personales', '01', yPos, pageWidth);
    yPos += 3;

    const edad = calcularEdad(vinculacion.fecha_nacimiento);
    const edadTexto = edad !== null ? `${edad} años` : 'No registrado';

    yPos = drawFieldsGrid(
        doc,
        [
            { label: 'Tipo de documento', value: textValue(vinculacion.tipo_documento) },
            { label: 'Número de documento', value: formatNumberWithDots(vinculacion.numero_documento) },
            { label: 'Fecha Score', value: formatFecha(vinculacion.fecha_score) },
        ],
        yPos,
        pageWidth
    );
    yPos = drawFieldsGrid(
        doc,
        [
            { label: 'Score', value: textValue(vinculacion.score) },
            {
                label: 'Nombres y apellidos',
                value: `${textValue(vinculacion.nombres)} ${textValue(vinculacion.apellidos)}`,
            },
            { label: '', value: '' },
        ],
        yPos,
        pageWidth
    );
    yPos = drawFieldsGrid(
        doc,
        [
            { label: 'Fecha de nacimiento', value: formatFecha(vinculacion.fecha_nacimiento) },
            { label: 'Edad', value: edadTexto },
            { label: 'Lugar de nacimiento', value: textValue(vinculacion.lugar_nacimiento) },
        ],
        yPos,
        pageWidth
    );
    yPos += 9;

    // 02 · Residencia y correspondencia
    yPos = drawSectionTitle(doc, 'Referencias Familiares', '02', yPos, pageWidth);
    yPos += 3;
    yPos = drawFieldsGrid(
        doc,
        [
            { label: 'Familiar ', value: textValue(vinculacion.familiar1_nombre) },
            { label: 'Parentesco', value: textValue(vinculacion.familiar1_parentesco) },
            { label: 'Celular', value: textValue(vinculacion.familiar1_telefono) },
            { label: 'Familiar', value: textValue(vinculacion.familiar2_nombre) },
            { label: 'Parentesco', value: textValue(vinculacion.familiar2_parentesco) },
            { label: 'Celular', value: textValue(vinculacion.familiar2_telefono) },
        ],
        yPos,
        pageWidth
    );
    yPos += 9;


    // 04 · Datos de contacto
    yPos = drawSectionTitle(doc, 'Referencias Personales', '04', yPos, pageWidth);
    yPos += 3;
    yPos = drawFieldsGrid(
        doc,
        [
            { label: 'Nombre ', value: textValue(vinculacion.personal1_nombre) },
            { label: 'Telefono', value: textValue(vinculacion.personal1_telefono) },
            { label: 'Direccion', value: textValue(vinculacion.personal1_direccion) },
            { label: 'Nombre', value: textValue(vinculacion.personal1_nombre) },
            { label: 'Telefono', value: textValue(vinculacion.personal2_telefono) },
            { label: 'Direccion', value: textValue(vinculacion.personal2_direccion) },
        ],
        yPos,
        pageWidth
    );
    yPos += 9;

    // 05 · Datos del conyuge
    yPos = drawSectionTitle(doc, 'Informacion Conyuge', '04', yPos, pageWidth);
    yPos += 3;
    yPos = drawFieldsGrid(
        doc,
        [
            { label: 'Nombre ', value: textValue(vinculacion.conyuge_nombre) },
            { label: 'Cedula', value: textValue(vinculacion.conyuge_cedula) },
            { label: 'Telefono', value: textValue(vinculacion.conyuge_telefono) },
        ],
        yPos,
        pageWidth
    );
    yPos += 9;

    drawFooter(doc);
    const fileName = `F2_${textValue(vinculacion.numero_documento)}_${textValue(vinculacion.nombres).replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);

};

