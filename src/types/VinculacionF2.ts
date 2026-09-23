export interface Fase2Item {
    id_fase2: number;
    id_postulacion: number;
    id_asociado: number;
    score: number;
    fecha_score: string;
    
    familiar1_nombre: string;
    familiar1_parentesco: string;
    familiar1_telefono: string;
    familiar2_nombre: string;
    familiar2_parentesco: string;
    familiar2_telefono: string;
    personal1_nombre: string;
    personal1_telefono: string;
    personal1_direccion: string;
    personal2_nombre: string;
    personal2_telefono: string;
    personal2_direccion: string;
    conyuge_nombre: string;
    conyuge_cedula: string;
    conyuge_telefono: string;
    fecha_nacimiento: string;
    fecha_creacion: string;
    fecha_actualizacion: string;

    lugar_procedencia: string;
    lugar_nacimiento: string;

    estado: string;
    tipo_documento: string;
    nombres: string;
    apellidos: string;
    numero_documento: string;
    correo_electronico: string;

    afiliador_nombre?: string | null;
    afiliador_usuario?: string | null;
}

export interface Fase2ApiResponse {
    success: boolean;
    data: Fase2Item[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    filters?: any;
}
