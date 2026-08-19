    // utils/pdfUtils.ts

    import jsPDF from 'jspdf';
    import autoTable from 'jspdf-autotable';

    /**
     * Agrega el logo de Coopserp al PDF
     */
    export const agregarLogoCoopserp = async (
        pdf: jsPDF,
        x: number,
        y: number,
        width: number = 45,
        height: number = 22
    ): Promise<void> => {
        try {
            // ✅ Ruta correcta para tu logo
            const logoPath = '/images/logo/coopserp.png';
            
            console.log('📄 Intentando cargar logo desde:', logoPath);

            const response = await fetch(logoPath);
            if (!response.ok) {
                console.warn(`⚠️ Logo no encontrado: ${response.status} - ${response.statusText}`);
                return;
            }

            const blob = await response.blob();

            const logoBase64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = () => {
                    console.error('❌ Error al leer el blob del logo');
                    resolve('');
                };
                reader.readAsDataURL(blob);
            });

            if (logoBase64) {
                pdf.addImage(logoBase64, 'PNG', x, y, width, height);
                console.log('✅ Logo cargado correctamente');
            }
        } catch (error) {
            console.warn('⚠️ Error cargando logo:', error);
        }
    };

    /**
     * Agrega un título centrado al PDF
     */
    export const agregarTitulo = (
        pdf: jsPDF,
        titulo: string,
        y: number,
        fontSize: number = 12,
        color: string = '#333333'
    ): void => {
        const pageWidth = pdf.internal.pageSize.getWidth();
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(color);
        pdf.text(titulo, pageWidth / 2, y, { align: 'center' });
    };

    /**
     * Agrega una línea decorativa
     */
    export const agregarLineaDecorativa = (
        pdf: jsPDF,
        y: number,
        color: string = '#663399'
    ): void => {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 14;
        pdf.setDrawColor(color);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageWidth - margin, y);
    };

    /**
     * Agrega un número de documento F1 y fecha
     */
    export const agregarNumeroF1 = (
        pdf: jsPDF,
        idSolicitante: number,
        fechaCreacion: string,
        y: number
    ): void => {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 14;
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor('#666666');
        pdf.text(`F1 No. ${idSolicitante}`, pageWidth - margin - 30, y);
        pdf.text(`Fecha: ${fechaCreacion}`, pageWidth - margin - 30, y + 7);
    };

    /**
     * Agrega una sección con título y tabla de datos
     */
    export const agregarSeccion = (
        pdf: jsPDF,
        titulo: string,
        datos: [string, string][],
        y: number
    ): number => {
        const margin = 14;
        let yPos = y + 5;
        
        // Título de la sección
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#333333');
        pdf.text(titulo, margin, yPos);
        yPos += 6;

        // Crear tabla con autoTable
        autoTable(pdf, {
            startY: yPos,
            body: datos,
            theme: 'plain',
            styles: {
                fontSize: 9,
                cellPadding: 2,
                lineColor: [200, 200, 200],
                lineWidth: 0.1,
            },
            columnStyles: {
                0: { cellWidth: 60, fontStyle: 'bold', textColor: [80, 80, 80] },
                1: { cellWidth: 'auto' },
            },
            margin: { left: margin, right: margin },
        });

        // Retornar la nueva posición Y
        return (pdf as any).lastAutoTable?.finalY + 8 || yPos + 20;
    };

    /**
     * Agrega el pie de página
     */
    export const agregarPiePagina = (pdf: jsPDF): void => {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        pdf.setFontSize(7);
        pdf.setTextColor('#999999');
        pdf.text(
            'Documento generado electrónicamente - Coopserp © 2025',
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    };

    /**
     * Agrega las firmas al final del documento
     */
    export const agregarFirmas = (pdf: jsPDF): void => {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 14;
        const firmaY = pageHeight - 35;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor('#555555');

        // Firma del solicitante
        const firmaX1 = margin;
        pdf.line(firmaX1, firmaY, firmaX1 + 60, firmaY);
        pdf.text('Firma del Solicitante', firmaX1, firmaY + 5);

        // Firma del responsable
        const firmaX3 = pageWidth / 2 + 10;
        pdf.line(firmaX3, firmaY, firmaX3 + 60, firmaY);
        pdf.text('Firma del Responsable', firmaX3, firmaY + 5);
    };

    /**
     * Agrega un subtítulo
     */
    export const agregarSubtitulo = (
        pdf: jsPDF,
        subtitulo: string,
        y: number,
        fontSize: number = 10,
        color: string = '#555555'
    ): void => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(color);
        pdf.text(subtitulo, 14, y);
    };

    /**
     * Agrega un encabezado de sección con número
     */
    export const agregarEncabezadoSeccion = (
        pdf: jsPDF,
        numero: string,
        titulo: string,
        y: number
    ): number => {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#2c3e50');
        pdf.text(`${numero}. ${titulo}`, 14, y);
        return y + 6;
    };

    /**
     * Agrega un campo de datos con etiqueta y valor
     */
    export const agregarCampo = (
        pdf: jsPDF,
        etiqueta: string,
        valor: string,
        x: number,
        y: number,
        etiquetaWidth: number = 50
    ): number => {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#555555');
        pdf.text(etiqueta, x, y);
        
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor('#333333');
        pdf.text(valor || 'N/A', x + etiquetaWidth, y);
        
        return y + 5;
    };

    /**
     * Agrega una tabla con datos
     */
    export const agregarTabla = (
        pdf: jsPDF,
        headers: string[],
        data: any[][],
        startY: number,
        options?: {
            title?: string;
            columnStyles?: any;
            headStyles?: any;
            bodyStyles?: any;
        }
    ): number => {
        const margin = 14;
        let yPos = startY;

        // Título opcional
        if (options?.title) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor('#333333');
            pdf.text(options.title, margin, yPos);
            yPos += 5;
        }

        autoTable(pdf, {
            startY: yPos,
            head: [headers],
            body: data,
            theme: 'striped',
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: 'bold',
            },
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            columnStyles: options?.columnStyles || {},
            margin: { left: margin, right: margin },
        });

        return (pdf as any).lastAutoTable?.finalY + 5 || startY + 20;
    };