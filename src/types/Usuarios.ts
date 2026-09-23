export  interface Users {
    id_usuario: number;
    nombre: string;
    usuario: string;
    contraseña: string;
    rol: string;
    activo: string | number;
   
}

export interface UsuarioPagination {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;

}

export interface UsersApiResponse {
    success: boolean;
    data: Users[];
    pagination: UsuarioPagination;
    filters: any;
    count: number
}