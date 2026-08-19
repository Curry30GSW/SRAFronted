export interface Vinculacion {
    id_solicitante: number;
    tipo_documento: string;
    numero_documento: string;
    lugar_expedicion: string;
    fecha_expedicion: string;
    nombres: string;
    apellidos: string;
    fecha_nacimiento: string;
    lugar_nacimiento: string;
    lugar_procedencia: string;
    ciudad_residencia: string;
    direccion_residencia: string;
    tipo_trabajador: 'EMPLEADO' | 'PENSIONADO' | null;
    pagaduria: string | null;
    empresa: string | null;
    sector_empresa: string | null;
    cargo: string | null;
    tiempo_cargo: string | null;
    direccion_correspondencia: string;
    ciudad_correspondencia: string;
    telefonos: string; 
    whatsapp: string;
    correo_electronico: string;
    central_riesgos: boolean;
    tratamiento_datos: boolean;
    apertura_coopserp: number;
    estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'EN_REVISION';
    fecha_creacion: string;
    fecha_actualizacion: string | null;
    activo: number;
}

export interface VinculacionPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface VinculacionApiResponse {
    success: boolean;
    data: Vinculacion[];
    pagination: VinculacionPagination;
    filters: any;
}

export interface VinculacionFilters {
    search?: string;
    estado?: string;
    tipoDocumento?: string;
    fechaInicio?: string;
    fechaFin?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}