export interface FormData {
  // Documento
  tipoDocumento: 'CC' | 'TI' | 'CE' | 'NIT' | ''
  cedula: string
  lugarExpedicion: string
  fechaExpedicion: string
  
  // Datos personales
  nombres: string
  apellidos: string
  lugarEscritura: string
  lugarNacimiento: string
  ciudadResidencia: string
  direccionResidencia: string
  fechaNacimiento: string
  
  // Laboral
  empresa: string
  tipoTrabajador: 'trabajador' | 'pensionado' | ''
  pagaduria?: string
  sectorEmpresa: 'publico' | 'privado' | 'mixto' | ''
  cargo?: string
  tiempoCargo?: string
  direccionCorrespondencia: string
  ciudadCorrespondencia: string
  
  // Contacto
  telefonos: string[]
  whatsapp: string
  correo: string
  
  // Autorizaciones
  autorizaCentralesRiesgo: boolean
  aceptaTratamientoDatos: boolean
  autorizaAperturaCuenta: boolean
}

export interface FormErrors {
  [key: string]: string
}