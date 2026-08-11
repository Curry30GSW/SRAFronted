export interface Asociado {
    DIST05: string
    AAUX05: string
    NCTA05: string
    DESC05: string
    NNIT05: string
    DIRE05: string
    CIUD05: string
    CORE05: string
    MORE05: string
    FRDA05: string
    BASE05: string
    MAIL05: string
    TCEL05: string
    TCE205: string
    TCE305: string
    WHA105: string
    WHA205: string
    WHA305: string
    DESC04: string
    INDC05: string
    EMPR05: string
}

export interface PaginationData {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

export interface SegmentoData {
    oro: Asociado[]
    plata: Asociado[]
    bronce: Asociado[]
}