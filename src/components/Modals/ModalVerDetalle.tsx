import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modals/index'
import { cn } from '@/utils/cn'
import { FetchDynamic } from '../Api/FetchDynamic'
import { formatFecha, formatSalario, formatNumberWithDots } from '@/utils/helps'

interface ModalVerDetalleProps {
    isOpen: boolean
    onClose: () => void
    nit: string
}

interface DetalleAsociado {
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
    FECN05: string
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
    DESC03: string
}

const MOTIVOS_RETIRO: Record<string, string> = {
    '01': 'Adquirió crédito con otra entidad',
    '04': 'Convenio Cancelado',
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
}

export const ModalVerDetalle: React.FC<ModalVerDetalleProps> = ({
    isOpen,
    onClose,
    nit
}) => {
    const [loading, setLoading] = useState(false)
    const [loadingCuenta, setLoadingCuenta] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [cuentas, setCuentas] = useState<DetalleAsociado[]>([])
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState<string>('')
    const [detalleCuenta, setDetalleCuenta] = useState<DetalleAsociado | null>(null)
    const [mostrarDetalle, setMostrarDetalle] = useState(false)

    // ✅ Paso 1: Obtener todas las cuentas por NIT
    const fetchCuentasPorNit = async () => {
        try {
            setLoading(true)
            setError(null)
            setMostrarDetalle(false)
            setDetalleCuenta(null)
            setCuentaSeleccionada('')

            const response = await FetchDynamic(`/asociados/nit/${nit}`)
            if (!response.ok) throw new Error('Error al cargar las cuentas')

            const result = await response.json()

            if (result.data && result.data.length > 0) {
                setCuentas(result.data)
            } else {
                setError('No se encontraron cuentas para este asociado')
            }
        } catch (err) {
            console.error('Error:', err)
            setError('Error al cargar las cuentas del asociado')
        } finally {
            setLoading(false)
        }
    }

    // ✅ Paso 2: Obtener detalle de la cuenta seleccionada
    const fetchDetalleCuenta = async (numeroCuenta: string) => {
        try {
            setLoadingCuenta(true)
            setError(null)

            const response = await FetchDynamic(`/asociados/cuenta/${numeroCuenta}`)
            if (!response.ok) throw new Error('Error al cargar el detalle')

            const result = await response.json()

            if (result.data && result.data.length > 0) {
                setDetalleCuenta(result.data[0])
                setMostrarDetalle(true)
            } else {
                setError('No se encontró el detalle de la cuenta')
            }
        } catch (err) {
            console.error('Error:', err)
            setError('Error al cargar el detalle de la cuenta')
        } finally {
            setLoadingCuenta(false)
        }
    }

    useEffect(() => {
        if (isOpen && nit) {
            fetchCuentasPorNit()
        }
    }, [isOpen, nit])

    const handleSeleccionarCuenta = (numeroCuenta: string) => {
        setCuentaSeleccionada(numeroCuenta)
        fetchDetalleCuenta(numeroCuenta)
    }

    const handleVolver = () => {
        setMostrarDetalle(false)
        setDetalleCuenta(null)
        setCuentaSeleccionada('')
    }

    const getMotivoDescripcion = (codigo: string) => {
        return MOTIVOS_RETIRO[codigo] || `Código ${codigo} (Sin descripción)`
    }

    const calcularEdad = (fechaNacimiento: string) => {
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

    // Función para formatear fecha de nacimiento
    const formatearFechaNacimiento = (fechaNacimiento: string) => {
        if (!fechaNacimiento || fechaNacimiento === '0' || fechaNacimiento === '') {
            return 'No disponible'
        }

        const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
            'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

        try {
            const año = parseInt(fechaNacimiento.substring(0, 4))
            const mes = parseInt(fechaNacimiento.substring(4, 6)) - 1
            const dia = fechaNacimiento.substring(6, 8)

            return `${dia} ${meses[mes]} ${año}`
        } catch {
            return 'No disponible'
        }
    }

    if (!isOpen) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            className="max-h-[90vh] overflow-hidden border-0 rounded-2xl shadow-2xl"
        >
            {/* Header */}
            <div className="relative">
                <div className="pl-6 pr-6 py-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                                {mostrarDetalle ? 'Detalle de la Cuenta' : 'Cuentas del Asociado'}
                            </h2>
                            <p className="text-sm text-gray-800 dark:text-gray-400 mt-0.5">
                                {mostrarDetalle
                                    ? `Cuenta: ${cuentaSeleccionada}`
                                    : `NIT: ${formatNumberWithDots(nit)} - Seleccione una cuenta`}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="px-6 py-6 bg-gray-50/50 dark:bg-gray-800/30 max-h-[70vh] overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                ) : mostrarDetalle && detalleCuenta ? (
                    // ✅ Mostrar detalle completo de la cuenta
                    <>
                        {/* Botón volver */}
                        <button
                            onClick={handleVolver}
                            className="mb-4 inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Volver a cuentas
                        </button>

                        {/* Información del asociado */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-4">
                            <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300">
                                    Información del Asociado
                                </h3>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-white uppercase tracking-wider">Nombre</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detalleCuenta.DESC05}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-white uppercase tracking-wider">Cédula</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatNumberWithDots(detalleCuenta.NNIT05)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-white uppercase tracking-wider">Fecha de Nacimiento</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatearFechaNacimiento(detalleCuenta.FECN05)}
                                        {detalleCuenta.FECN05 && detalleCuenta.FECN05 !== '0' && (
                                            <span className="ml-2 text-xs font-bold text-gray-800 dark:text-gray-400">
                                                ({calcularEdad(detalleCuenta.FECN05)} años)
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-white uppercase tracking-wider">Dirección</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detalleCuenta.DIRE05 || 'No registrada'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 dark:text-white uppercase tracking-wider">Ciudad</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detalleCuenta.CIUD05 || 'No registrada'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Información de la cuenta */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mb-4">
                            <div className="px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300">
                                    Detalle de la Cuenta
                                </h3>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-white uppercase tracking-wider">Número de Cuenta</p>
                                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{detalleCuenta.NCTA05}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-white uppercase tracking-wider">Agencia</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detalleCuenta.DIST05} - {detalleCuenta.DESC03}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-white uppercase tracking-wider">Nómina</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detalleCuenta.DESC04}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-white uppercase tracking-wider">Salario</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatSalario(detalleCuenta.BASE05)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-white uppercase tracking-wider">Fecha de Retiro</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatFecha(detalleCuenta.FRDA05)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-white uppercase tracking-wider">Motivo de Retiro</p>
                                    <p className="text-sm font-medium text-red-600 dark:text-red-400">{getMotivoDescripcion(detalleCuenta.MORE05)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contacto */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-300">
                                    Contacto
                                </h3>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-white uppercase tracking-wider">Teléfono Celular</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detalleCuenta.TCEL05 || 'No registrado'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-white uppercase tracking-wider">Teléfono 2</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detalleCuenta.TCE205 || 'No registrado'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-white uppercase tracking-wider">Teléfono 3</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detalleCuenta.TCE305 || 'No registrado'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-white uppercase tracking-wider">WhatsApp 1</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detalleCuenta.WHA105 || 'No registrado'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-white uppercase tracking-wider">WhatsApp 2</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detalleCuenta.WHA205 || 'No registrado'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-white uppercase tracking-wider">WhatsApp 3</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{detalleCuenta.WHA305 || 'No registrado'}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // ✅ Lista de cuentas para seleccionar
                    <div className="space-y-3">
                        <p className="text-sm text-gray-900 dark:text-gray-400 mb-4">
                            Se encontraron <span className="font-semibold">{cuentas.length}</span> cuentas para este asociado.
                            Seleccione una para ver los detalles:
                        </p>

                        {cuentas.map((cuenta, index) => {
                            const salario = parseFloat(cuenta.BASE05)
                            let segmento = 'Bronce'
                            let colorSegmento = 'bg-gray-100 text-gray-700 border-gray-300'
                            if (salario >= 5000000) {
                                segmento = 'Oro'
                                colorSegmento = 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300'
                            } else if (salario >= 3500000) {
                                segmento = 'Plata'
                                colorSegmento = 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700/30 dark:text-gray-300'
                            }

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleSeleccionarCuenta(cuenta.NCTA05)}
                                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-500">
                                                    #{index + 1}
                                                </span>
                                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                    {cuenta.NCTA05}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-300">
                                                    {cuenta.DESC04}
                                                </span>
                                                <span className={cn(
                                                    'inline-flex px-2 py-0.5 rounded-full text-sm font-semibold border',
                                                    colorSegmento
                                                )}>
                                                    {segmento}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-400">
                                                    Salario: {formatSalario(cuenta.BASE05)}
                                                </span>
                                                <span className="text-xs font-medium text-gray-800 dark:text-gray-400">
                                                    Fecha Retiro: {formatFecha(cuenta.FRDA05)}
                                                </span>

                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            )
                        })}

                        {loadingCuenta && (
                            <div className="flex items-center justify-center py-4">
                                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span className="ml-2 text-sm text-gray-500">Cargando detalles...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-100 dark:border-gray-800 rounded-b-2xl">
                <div className="flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </Modal>
    )
}