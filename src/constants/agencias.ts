export interface Agencia {
    codigo: string
    nombre: string
    direccion: string
}

export const AGENCIAS: Agencia[] = [
    { codigo: '30', nombre: 'CALI - BUSINESS CENTER SEDE SUR', direccion: 'CARRERA 100 # 16-321 OFICINA # 1206 EDIFICIO JARDÍN CENTRAL BUSINESS CENTER' },
    { codigo: '31', nombre: 'CALI SEDE CENTRO', direccion: 'CRA 8 # 10-47 BARRIO CENTRO' },
    { codigo: '32', nombre: 'PALMIRA', direccion: 'CALLE 30 # 28-74 EDIFICIO CAJA AGRARIA' },
    { codigo: '33', nombre: 'BUENAVENTURA', direccion: 'CALLE 7 # 3-11 OFC.702 PISO 7 EDIF. PACIFIC TRADE CENTER' },
    { codigo: '34', nombre: 'BUGA', direccion: 'CALLE 5 # 12-31 BARRIO JOSE MARIA CABAL' },
    { codigo: '35', nombre: 'TULUA', direccion: 'CARRERA 25 # 31 - 50 BARRIO SALESIANO' },
    { codigo: '36', nombre: 'SEVILLA', direccion: 'CARRERA 50 # 48-69 BARRIO CENTRO' },
    { codigo: '37', nombre: 'LA UNION', direccion: 'CARRERA 13 # 13-24 LOCAL 1 BARRIO CENTRO' },
    { codigo: '38', nombre: 'ROLDANILLO', direccion: 'CALLE 8 # 8-86 BARRIO CENTRO' },
    { codigo: '39', nombre: 'CARTAGO', direccion: 'CARRERA 4 # 11-28 OFIC. 201 EDIFICIO DIAZ LOPEZ PISO 2' },
    { codigo: '40', nombre: 'ZARZAL', direccion: 'CARRERA 8 # 8-45 PISO 1 BARRIO QUINDIO' },
    { codigo: '41', nombre: 'CAICEDONIA', direccion: 'CARRERA 16 # 9-01 BARRIO CENTRO' },
    { codigo: '42', nombre: 'SANTANDER DE QUILICHAO', direccion: 'CALLE 5 # 10-03 EDIFICIO ERE OFICINAS 403,404 Y 405' },
    { codigo: '43', nombre: 'YUMBO', direccion: 'CARRERA 5 # 4-35 BARRIO BELALCAZAR' },
    { codigo: '44', nombre: 'JAMUNDI', direccion: 'CALLE 10 # 9-54 EDIFICIO GUAYABALES LOCAL 4' },
    { codigo: '45', nombre: 'PASTO', direccion: 'CARRERA 24 # 19-33 PISO 2 LOCAL 204-205 EDIFICIO PASTO PLAZA' },
    { codigo: '46', nombre: 'POPAYAN', direccion: 'CARRERA 8 # 3-71 LOCAL 105 EIDF. CLUB DE LEONES' },
    { codigo: '47', nombre: 'IPIALES', direccion: 'CARRERA 6 # 11-50 OFICINA 420 CENTRO COMERCIAL ZAFIRO' },
    { codigo: '48', nombre: 'LETICIA', direccion: 'CALLE 10 # 9-98 BARRIO CENTRO' },
    { codigo: '49', nombre: 'PUERTO ASIS', direccion: 'CARRERA 24 # 19-33 PISO 2 LOCAL 204-205 EDIFICIO PASTO PLAZA' },
    { codigo: '68', nombre: 'SOACHA', direccion: 'CARRERA 8 # 14-74 BARRIO LINCON' },
    { codigo: '70', nombre: 'MANIZALES', direccion: 'CARRERA 24 # 22-02 EDIF PLAZA CENTRO OFC 404' },
    { codigo: '74', nombre: 'PEREIRA', direccion: 'CARRERA 7 # 19-28 OFIC. 10-02 EDIF.TORRE BOLIVAR' },
    { codigo: '76', nombre: 'GIRARDOT', direccion: 'CARRERA 11 # 18-50 BARRIO SUCRE' },
    { codigo: '77', nombre: 'SAN ANDRES', direccion: 'CARRERA 4 AVENIDA COLON 1A EDIFICIO SALAZAR LOCAL 102' },
    { codigo: '78', nombre: 'ARMENIA', direccion: 'CENTRO COMERCIAL ALTA VISTA CR 13-19-09 PISO 1, LOCAL 11.' },
    { codigo: '80', nombre: 'MEDELLIN', direccion: 'CARRERA 52 # 43-31 OFIC.212 EDIFICIO ANTIGUA ESTACION DEL FERROCARRIL' },
    { codigo: '81', nombre: 'MONTERIA', direccion: 'CARRERA 6 # 24-12 BARRIO CENTRO' },
    { codigo: '82', nombre: 'SINCELEJO', direccion: 'CARRERA 20 # 19-19 LOCAL 3 EDIFICIO LA BENDICION. BARRIO LA FORD' },
    { codigo: '83', nombre: 'YOPAL', direccion: 'CALLE 15 # 20-35 LOCAL 01 BARRIO BELLO HORIZONTE' },
    { codigo: '84', nombre: 'RIOHACHA', direccion: 'CARRERA 7 # 3-28 BARRIO CENTRO' },
    { codigo: '85', nombre: 'VALLEDUPAR', direccion: 'CARRERA 7 # 15-72 LOCAL 2 EDIFICIO PUMAREJO-COTES' },
    { codigo: '86', nombre: 'CARTAGENA', direccion: 'CALLE 32 # 5-09 OFIC. 514 EDIF ANDIAN PLAZA DE LA ADUANA CENTRO' },
    { codigo: '87', nombre: 'BARRANQUILLA', direccion: 'CALLE 39 # 43-123 LOCAL 2 EDIFICIO LAS FLORES' },
    { codigo: '88', nombre: 'SANTA MARTA', direccion: 'CALLE 23 NO 4 -27 LOCAL 124 EDIFICIO CENTRO EJECUTIVO' },
    { codigo: '89', nombre: 'DUITAMA', direccion: 'CARRERA 15 # 14-58 OFICINA 507 EDIFICIO PLAZA' },
    { codigo: '90', nombre: 'BOGOTA CENTRO', direccion: 'CALLE 12 # 7-32 OFIC. 808 BANCO COMERCIAL ANTIOQUEÑO' },
    { codigo: '91', nombre: 'BOGOTA T.C.', direccion: 'AVENIDA CALLE 26 # 69 -76 TORRE TIERRA 3 EDIFICIO ELEMENTO OFICINA 1303' },
    { codigo: '92', nombre: 'BOGOTA NORTE', direccion: 'CALLE 90 # 19A- 49 OFICINA 803 EDIFICIO BAMBU' },
    { codigo: '93', nombre: 'VILLAVICENCIO', direccion: 'CALLE 38 # 32-41 OFICINA 904-905 EDIFICIO PARQUE SANTANDER' },
    { codigo: '94', nombre: 'TUNJA', direccion: 'CARRERA 10 # 16-19 LOCAL 204 EDIFICIO BANCOLOMBIA' },
    { codigo: '95', nombre: 'IBAGUE', direccion: 'CALLE 10 # 3-76 OFICINA 504 EDIFICIO CAMARA DE COMERCIO' },
    { codigo: '96', nombre: 'NEIVA', direccion: 'CARRERA 5 # 13-19 LOCAL 4 EDIFICIO EL CEDRAL' },
    { codigo: '97', nombre: 'BUCARAMANGA', direccion: 'CALLE 34 # 18-64 OFIC. 202 CENTRO COMERCIAL ROSEDAL' },
    { codigo: '98', nombre: 'CUCUTA', direccion: 'CALLE 16 # 2-74 BARRIO LA PLAYA' },
]

/**
 * Busca una agencia por su código
 */
export const getAgenciaByCodigo = (codigo: string): Agencia | undefined =>
    AGENCIAS.find(a => a.codigo === codigo)

/**
 * Busca una agencia por su nombre
 */
export const getAgenciaByNombre = (nombre: string): Agencia | undefined =>
    AGENCIAS.find(a => a.nombre === nombre)