import { useState, useRef, useEffect } from 'react'
import { Input } from '../../components/ui/Input'
import { CitySelect } from '../../components/forms/CitySelect'
import { DateInput } from '../../components/forms/DateInput'
import { PhoneInput } from '../../components/forms/PhoneInput'
import { FormData, FormErrors } from '../../types/AsociacionForm'
import { cn } from '../../utils/cn'
import coopserpLogo from '../../../public/images/logo/coopserp.png';
import { FetchDynamic } from '../../components/Api/FetchDynamic'
import { ModalSolicitudEnviada } from '../../components/Modals/ModalSolicitudEnviada'

const initialFormData: FormData = {
    tipoDocumento: '',
    cedula: '',
    lugarExpedicion: '',
    fechaExpedicion: '',
    nombres: '',
    apellidos: '',
    lugarEscritura: '',
    lugarNacimiento: '',
    ciudadResidencia: '',
    direccionResidencia: '',
    fechaNacimiento: '',
    empresa: '',
    tipoTrabajador: '',
    pagaduria: '',
    sectorEmpresa: '',
    cargo: '',
    tiempoCargo: '',
    direccionCorrespondencia: '',
    ciudadCorrespondencia: '',
    telefonos: [],
    whatsapp: '',
    correo: '',
    autorizaCentralesRiesgo: false,
    aceptaTratamientoDatos: false,
    autorizaAperturaCuenta: false,
}

const mapTipoTrabajador = (value: FormData['tipoTrabajador']) => {
    if (value === 'trabajador') return 'EMPLEADO'
    if (value === 'pensionado') return 'PENSIONADO'
    return null
}

const mapSectorEmpresa = (value: FormData['sectorEmpresa']) => {
    if (!value) return null
    return value.toUpperCase()
}

// Configuración de pasos
const STEPS = [
    { id: 1, label: 'Documento de Identificación', labelShort: 'Doc' },
    { id: 2, label: 'Datos Personales', labelShort: 'Personal' },
    { id: 3, label: 'Información Laboral', labelShort: 'Laboral' },
    { id: 4, label: 'Información Adicional', labelShort: 'Contacto' },
    { id: 5, label: 'Autorizaciones', labelShort: 'Autoriz.' },
]

const AffiliationForm = () => {
    const cedulaRef = useRef<HTMLInputElement>(null)
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [validationPassed, setValidationPassed] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [currentDateTime, setCurrentDateTime] = useState('')

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date()
            const dateStr = now.toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
            const timeStr = now.toLocaleTimeString('es-CO', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            })
            setCurrentDateTime(`${dateStr} - ${timeStr}`)
        }
        updateDateTime()
        // Actualizar cada minuto
        const interval = setInterval(updateDateTime)
        return () => clearInterval(interval)
    }, [])


    const validateCedula = (value: string) => {
        return /^\d+$/.test(value)
    }

    const validateDocumento = () => {
        const newErrors: FormErrors = {}

        if (!formData.tipoDocumento) {
            newErrors.tipoDocumento = 'Seleccione un tipo de documento'
        }

        if (!formData.cedula) {
            newErrors.cedula = 'La cédula es requerida'
        } else if (!validateCedula(formData.cedula)) {
            newErrors.cedula = 'La cédula solo debe contener números'
        }

        if (!formData.lugarExpedicion) {
            newErrors.lugarExpedicion = 'El lugar de expedición es requerido'
        }

        if (!formData.fechaExpedicion) {
            newErrors.fechaExpedicion = 'La fecha de expedición es requerida'
        }

        setErrors(newErrors)
        const isValid = Object.keys(newErrors).length === 0

        if (isValid) {
            setValidationPassed(true)
        } else {
            if (newErrors.cedula && cedulaRef.current) {
                cedulaRef.current.focus()
            }
        }

        return isValid
    }

    const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '')
        setFormData({ ...formData, cedula: value })
        if (errors.cedula) {
            setErrors({ ...errors, cedula: '' })
        }
    }

    const validateCurrentStep = (): boolean => {
        if (currentStep === 1) {
            if (!validationPassed) {
                const isValid = validateDocumento()
                if (!isValid) return false
            }
            return true
        }

        if (currentStep === 2) {
            const newErrors: FormErrors = {}
            if (!formData.nombres) newErrors.nombres = 'Nombres requeridos'
            if (!formData.apellidos) newErrors.apellidos = 'Apellidos requeridos'
            if (!formData.lugarEscritura) newErrors.lugarEscritura = 'Lugar de escritura requerido'
            if (!formData.lugarNacimiento) newErrors.lugarNacimiento = 'Lugar de nacimiento requerido'
            if (!formData.ciudadResidencia) newErrors.ciudadResidencia = 'Ciudad de residencia requerida'
            if (!formData.direccionResidencia) newErrors.direccionResidencia = 'Dirección de residencia requerida'
            if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'Fecha de nacimiento requerida'
            setErrors(newErrors)
            return Object.keys(newErrors).length === 0
        }

        if (currentStep === 3) {
            const newErrors: FormErrors = {}

            if (!formData.tipoTrabajador) {
                newErrors.tipoTrabajador = 'Tipo de trabajador requerido'
            }

            if (formData.tipoTrabajador === 'trabajador') {
                if (!formData.empresa) newErrors.empresa = 'Empresa requerida'
                if (!formData.sectorEmpresa) newErrors.sectorEmpresa = 'Sector de la empresa requerido'
                if (!formData.cargo) newErrors.cargo = 'Cargo requerido'
                if (!formData.tiempoCargo) newErrors.tiempoCargo = 'Tiempo en el cargo requerido'
            }

            if (formData.tipoTrabajador === 'pensionado') {
                if (!formData.pagaduria) newErrors.pagaduria = 'Pagaduría requerida'
            }

            setErrors(newErrors)
            return Object.keys(newErrors).length === 0
        }

        if (currentStep === 4) {
            const newErrors: FormErrors = {}
            if (!formData.direccionCorrespondencia) newErrors.direccionCorrespondencia = 'Dirección de correspondencia requerida'
            if (!formData.ciudadCorrespondencia) newErrors.ciudadCorrespondencia = 'Ciudad de correspondencia requerida'
            if (formData.telefonos.length === 0) newErrors.telefonos = 'Al menos un teléfono requerido'
            if (!formData.whatsapp) newErrors.whatsapp = 'WhatsApp requerido'
            if (!formData.correo) newErrors.correo = 'Correo electrónico requerido'
            setErrors(newErrors)
            return Object.keys(newErrors).length === 0
        }

        if (currentStep === 5) {
            return true
        }

        return true
    }

    const handleNextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(Math.min(currentStep + 1, STEPS.length))
            setErrors({})
        }
    }

    const handlePrevStep = () => {
        setCurrentStep(Math.max(1, currentStep - 1))
        setErrors({})
    }

    const buildVinculacionPayload = (formData: FormData) => ({
        tipo_documento: formData.tipoDocumento,
        numero_documento: formData.cedula,
        lugar_expedicion: formData.lugarExpedicion,
        fecha_expedicion: formData.fechaExpedicion,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        fecha_nacimiento: formData.fechaNacimiento,
        lugar_nacimiento: formData.lugarNacimiento,
        lugar_procedencia: formData.lugarEscritura,
        ciudad_residencia: formData.ciudadResidencia,
        direccion_residencia: formData.direccionResidencia,
        tipo_trabajador: mapTipoTrabajador(formData.tipoTrabajador),
        pagaduria: formData.pagaduria || null,
        empresa: formData.empresa || null,
        sector_empresa: mapSectorEmpresa(formData.sectorEmpresa),
        cargo: formData.cargo || null,
        tiempo_cargo: formData.tiempoCargo || null,
        direccion_correspondencia: formData.direccionCorrespondencia,
        ciudad_correspondencia: formData.ciudadCorrespondencia,
        telefonos: formData.telefonos,
        whatsapp: formData.whatsapp,
        correo_electronico: formData.correo,
        central_riesgos: formData.autorizaCentralesRiesgo,
        tratamiento_datos: formData.aceptaTratamientoDatos,
        apertura_coopserp: formData.autorizaAperturaCuenta
    })

    const validateAutorizaciones = (): boolean => {
        const newErrors: FormErrors = {}
        if (!formData.autorizaCentralesRiesgo) {
            newErrors.autorizaCentralesRiesgo = 'Debe autorizar la consulta en centrales de riesgo'
        }
        if (!formData.aceptaTratamientoDatos) {
            newErrors.aceptaTratamientoDatos = 'Debe aceptar el tratamiento de datos'
        }
        if (!formData.autorizaAperturaCuenta) {
            newErrors.autorizaAperturaCuenta = 'Debe autorizar la apertura de cuenta'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)

        // Validar documento
        if (!validateDocumento()) return

        // Validar autorizaciones (paso 5)
        if (!validateAutorizaciones()) return


        const currentStepBackup = currentStep

        // Validar paso 2
        setCurrentStep(2)
        if (!validateCurrentStep()) {
            setCurrentStep(currentStepBackup)
            return
        }

        // Validar paso 3
        setCurrentStep(3)
        if (!validateCurrentStep()) {
            setCurrentStep(currentStepBackup)
            return
        }

        // Validar paso 4
        setCurrentStep(4)
        if (!validateCurrentStep()) {
            setCurrentStep(currentStepBackup)
            return
        }

        // Restaurar paso actual
        setCurrentStep(currentStepBackup)

        // Si todo está validado, enviar
        setIsSubmitting(true)

        try {
            const payload = buildVinculacionPayload(formData)
            const response = await FetchDynamic('/vinculacion', {
                method: 'POST',
                body: JSON.stringify(payload)
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'No se pudo enviar la solicitud')
            }

            setFormData(initialFormData)
            setErrors({})
            setValidationPassed(false)
            setCurrentStep(1)
            setShowSuccessModal(true)

        } catch (err) {
            setSubmitError(
                err instanceof Error
                    ? err.message
                    : 'Error desconocido al enviar el formulario'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    // ==================== STEP INDICATOR ====================
    const renderStepIndicator = () => (
        <div className="mb-8">
            <div className="hidden sm:block">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-orbit-border">
                        <div
                            className="h-full bg-green-700 transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                        />
                    </div>

                    {STEPS.map((step, index) => {
                        const isCompleted = index + 1 < currentStep
                        const isActive = index + 1 === currentStep
                        const isPending = index + 1 > currentStep

                        return (
                            <div key={step.id} className="relative flex flex-col items-center z-10">
                                <button
                                    onClick={() => {
                                        if (index + 1 < currentStep) {
                                            setCurrentStep(index + 1)
                                        }
                                    }}
                                    disabled={isPending}
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                                        isCompleted && 'bg-green-700 text-white',
                                        isActive && 'bg-green-700 text-white ring-4 ring-green-700/30 scale-110',
                                        isPending && 'bg-orbit-surface2 text-slate-500 border-2 border-orbit-border cursor-not-allowed'
                                    )}
                                >
                                    {isCompleted ? '✓' : step.id}
                                </button>
                                <span className={cn(
                                    'text-xs mt-2 whitespace-nowrap transition-colors',
                                    isActive && 'text-green-700 font-semibold',
                                    isCompleted && 'text-slate-300',
                                    isPending && 'text-slate-500'
                                )}>
                                    {step.label}
                                </span>
                                {isActive && (
                                    <div className="absolute -bottom-6 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-green-700" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="sm:hidden">
                <div className="flex items-center justify-between gap-1">
                    {STEPS.map((step, index) => {
                        const isCompleted = index + 1 < currentStep
                        const isActive = index + 1 === currentStep
                        const isPending = index + 1 > currentStep

                        return (
                            <div key={step.id} className="flex-1 flex flex-col items-center">
                                <button
                                    onClick={() => {
                                        if (index + 1 < currentStep) {
                                            setCurrentStep(index + 1)
                                        }
                                    }}
                                    disabled={isPending}
                                    className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                                        isCompleted && 'bg-green-700 text-white',
                                        isActive && 'bg-green-700 text-white ring-4 ring-green-700/30 scale-110',
                                        isPending && 'bg-orbit-surface2 text-slate-500 border-2 border-orbit-border cursor-not-allowed'
                                    )}
                                >
                                    {isCompleted ? '✓' : step.id}
                                </button>
                                <span className={cn(
                                    'text-[10px] mt-1 transition-colors text-center',
                                    isActive && 'text-green-700 font-semibold',
                                    isCompleted && 'text-slate-400',
                                    isPending && 'text-slate-500'
                                )}>
                                    {step.labelShort}
                                </span>
                            </div>
                        )
                    })}
                </div>
                <div className="mt-3 w-full h-1 bg-orbit-border rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-700 transition-all duration-500 rounded-full"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>
                <p className="text-center text-xs text-slate-500 mt-2">
                    Paso {currentStep} de {STEPS.length}
                </p>
            </div>
        </div>
    )

    const renderStep1 = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-300 mb-1.5">
                        Tipo de Documento <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={formData.tipoDocumento}
                        onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value as FormData['tipoDocumento'] })}
                        className="w-full h-9 rounded-lg border border-gray-300 dark:border-orbit-border bg-white dark:bg-orbit-surface2 px-3 text-sm text-gray-900 dark:text-slate-200 focus:border-orbit-primary focus:ring-1 focus:ring-orbit-primary/30 outline-none"
                    >
                        <option value="">Seleccione tipo</option>
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="NIT">NIT</option>
                    </select>
                    {errors.tipoDocumento && <p className="text-sm text-red-500 dark:text-orbit-danger mt-1">{errors.tipoDocumento}</p>}
                </div>

                <Input
                    ref={cedulaRef}
                    label="Número de Cédula"
                    value={formData.cedula}
                    onChange={handleCedulaChange}
                    error={errors.cedula}
                    placeholder="Solo números"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CitySelect
                    label="Lugar de Expedición"
                    value={formData.lugarExpedicion}
                    onChange={(value) => setFormData({ ...formData, lugarExpedicion: value })}
                    error={errors.lugarExpedicion}
                    required
                />
                <DateInput
                    label="Fecha de Expedición"
                    value={formData.fechaExpedicion}
                    onChange={(value) => setFormData({ ...formData, fechaExpedicion: value })}
                    error={errors.fechaExpedicion}
                    required
                />
            </div>

            {!validationPassed && (
                <button
                    type="button"
                    onClick={validateDocumento}
                    className="mt-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-700/80 transition-colors"
                >
                    Validar Documento
                </button>
            )}
            {validationPassed && (
                <p className="text-green-700 dark:text-green-400 text-sm mt-2 flex items-center gap-2">
                    Documento validado correctamente
                </p>
            )}
        </div>
    )

    // ==================== PASO 2: DATOS PERSONALES ====================
    const renderStep2 = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Nombres"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    error={errors.nombres}
                    placeholder="Ej: Juan Carlos"
                    required
                />
                <Input
                    label="Apellidos"
                    value={formData.apellidos}
                    onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                    error={errors.apellidos}
                    placeholder="Ej: Pérez Gómez"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateInput
                    label="Fecha de Nacimiento"
                    value={formData.fechaNacimiento}
                    onChange={(value) => setFormData({ ...formData, fechaNacimiento: value })}
                    error={errors.fechaNacimiento}
                    required
                />
                <CitySelect
                    label="Lugar de Nacimiento"
                    value={formData.lugarNacimiento}
                    onChange={(value) => setFormData({ ...formData, lugarNacimiento: value })}
                    error={errors.lugarNacimiento}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CitySelect
                    label="Lugar de donde nos escribe"
                    value={formData.lugarEscritura}
                    onChange={(value) => setFormData({ ...formData, lugarEscritura: value })}
                    error={errors.lugarEscritura}
                    required
                />
                <CitySelect
                    label="Ciudad de Residencia"
                    value={formData.ciudadResidencia}
                    onChange={(value) => setFormData({ ...formData, ciudadResidencia: value })}
                    error={errors.ciudadResidencia}
                    required
                />
                <Input
                    label="Dirección de Residencia"
                    value={formData.direccionResidencia}
                    onChange={(e) => setFormData({ ...formData, direccionResidencia: e.target.value })}
                    error={errors.direccionResidencia}
                    placeholder="Cra 45 # 23-12"
                    required
                />
            </div>
        </div>
    )

    // ==================== PASO 3: LABORAL ====================
    const renderStep3 = () => (
        <div className="space-y-4">
            {/* PRIMERO: Tipo de Trabajador */}
            <div>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-300 mb-1.5">
                    Tipo de Trabajador <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                        <input
                            type="radio"
                            value="trabajador"
                            checked={formData.tipoTrabajador === 'trabajador'}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    tipoTrabajador: e.target.value as FormData['tipoTrabajador'],
                                    cargo: '',
                                    tiempoCargo: '',
                                    pagaduria: ''
                                })
                            }}
                            className="accent-orbit-primary"
                        />
                        Empleado
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                        <input
                            type="radio"
                            value="pensionado"
                            checked={formData.tipoTrabajador === 'pensionado'}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    tipoTrabajador: e.target.value as FormData['tipoTrabajador'],
                                    cargo: '',
                                    tiempoCargo: ''
                                })
                            }}
                            className="accent-orbit-primary"
                        />
                        Pensionado
                    </label>
                </div>
                {errors.tipoTrabajador && <p className="text-sm text-red-500 dark:text-orbit-danger mt-1">{errors.tipoTrabajador}</p>}
            </div>

            {/* SI ES EMPLEADO: Mostrar empresa, sector, cargo y tiempo */}
            {formData.tipoTrabajador === 'trabajador' && (
                <>
                    <Input
                        label="Empresa donde trabaja"
                        value={formData.empresa}
                        onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                        error={errors.empresa}
                        placeholder="Nombre de la empresa"
                        required
                    />

                    <div>
                        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-300 mb-1.5">
                            Sector de la empresa <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-6 flex-wrap">
                            {['publico', 'privado', 'mixto'].map((sector) => (
                                <label key={sector} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
                                    <input
                                        type="radio"
                                        value={sector}
                                        checked={formData.sectorEmpresa === sector}
                                        onChange={(e) => setFormData({ ...formData, sectorEmpresa: e.target.value as FormData['sectorEmpresa'] })}
                                        className="accent-orbit-primary"
                                    />
                                    {sector.charAt(0).toUpperCase() + sector.slice(1)}
                                </label>
                            ))}
                        </div>
                        {errors.sectorEmpresa && <p className="text-sm text-red-500 dark:text-orbit-danger mt-1">{errors.sectorEmpresa}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Cargo"
                            value={formData.cargo || ''}
                            onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                            error={errors.cargo}
                            placeholder="Ej: Gerente"
                            required
                        />
                        <Input
                            label="Tiempo en el cargo"
                            value={formData.tiempoCargo || ''}
                            onChange={(e) => setFormData({ ...formData, tiempoCargo: e.target.value })}
                            error={errors.tiempoCargo}
                            placeholder="Ej: 2 años, 6 meses"
                            required
                        />
                    </div>
                </>
            )}

            {/* SI ES PENSIONADO: Mostrar solo pagaduría */}
            {formData.tipoTrabajador === 'pensionado' && (
                <Input
                    label="Pagaduría a la que pertenece"
                    value={formData.pagaduria || ''}
                    onChange={(e) => setFormData({ ...formData, pagaduria: e.target.value })}
                    error={errors.pagaduria}
                    placeholder="Nombre de la pagaduría"
                    required
                />
            )}
        </div>
    )

    // ==================== PASO 4: CONTACTO ====================
    const renderStep4 = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Dirección de Correspondencia"
                    value={formData.direccionCorrespondencia}
                    onChange={(e) => setFormData({ ...formData, direccionCorrespondencia: e.target.value })}
                    error={errors.direccionCorrespondencia}
                    placeholder="Cra 45 # 23-12"
                    required
                />
                <CitySelect
                    label="Ciudad de Correspondencia"
                    value={formData.ciudadCorrespondencia}
                    onChange={(value) => setFormData({ ...formData, ciudadCorrespondencia: value })}
                    error={errors.ciudadCorrespondencia}
                    required
                />
            </div>

            <PhoneInput
                label="Teléfonos de contacto"
                values={formData.telefonos}
                onChange={(values) => setFormData({ ...formData, telefonos: values })}
                error={errors.telefonos}
                required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="WhatsApp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    error={errors.whatsapp}
                    placeholder="3001234567 ó @UsuarioWhatsApp"
                    required
                />
                <Input
                    label="Correo Electrónico"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    error={errors.correo}
                    placeholder="ejemplo@correo.com"
                    required
                />
            </div>
        </div>
    )

    // ==================== PASO 5: AUTORIZACIONES ====================
    const renderStep5 = () => (
        <div className="space-y-4">
            <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/5 rounded-lg border border-blue-200 dark:border-blue-500/10">
                    <input
                        type="checkbox"
                        id="autorizaCentralesRiesgo"
                        checked={formData.autorizaCentralesRiesgo}
                        onChange={(e) => setFormData({ ...formData, autorizaCentralesRiesgo: e.target.checked })}
                        className="mt-1 accent-green-700 dark:accent-green-500"
                    />
                    <label htmlFor="autorizaCentralesRiesgo" className="text-sm text-gray-700 dark:text-slate-200">
                        ¿Usted autoriza a Coopserp para que consulte sus datos en las centrales de riesgo?
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                </div>
                {errors.autorizaCentralesRiesgo && (
                    <p className="text-sm text-red-500 dark:text-orbit-danger ml-7">{errors.autorizaCentralesRiesgo}</p>
                )}
                {!formData.autorizaCentralesRiesgo && formData.autorizaCentralesRiesgo !== undefined && (
                    <div className="ml-7 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            Si no autoriza la consulta en centrales de riesgo, no es posible continuar con el proceso debido a que es un requisito para nosotros al momento de hacer una afiliación.
                        </p>
                    </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/5 rounded-lg border border-blue-200 dark:border-blue-500/10">
                    <input
                        type="checkbox"
                        id="aceptaTratamientoDatos"
                        checked={formData.aceptaTratamientoDatos}
                        onChange={(e) => setFormData({ ...formData, aceptaTratamientoDatos: e.target.checked })}
                        className="mt-1 accent-green-700 dark:accent-green-500"
                    />
                    <label htmlFor="aceptaTratamientoDatos" className="text-sm text-gray-700 dark:text-slate-200">
                        Acepto el tratamiento de datos personales según la Ley 1581 de 2012
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                </div>
                {errors.aceptaTratamientoDatos && (
                    <p className="text-sm text-red-500 dark:text-orbit-danger ml-7">{errors.aceptaTratamientoDatos}</p>
                )}

                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/5 rounded-lg border border-blue-200 dark:border-blue-500/10">
                    <input
                        type="checkbox"
                        id="autorizaAperturaCuenta"
                        checked={formData.autorizaAperturaCuenta}
                        onChange={(e) => setFormData({ ...formData, autorizaAperturaCuenta: e.target.checked })}
                        className="mt-1 accent-green-700 dark:accent-green-500"
                    />
                    <label htmlFor="autorizaAperturaCuenta" className="text-sm text-gray-700 dark:text-slate-200">
                        Autorizo la apertura de cuenta y vinculación con Coopserp en caso de que la afiliación sea viable
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                </div>
                {errors.autorizaAperturaCuenta && (
                    <p className="text-sm text-red-500 dark:text-orbit-danger ml-7">{errors.autorizaAperturaCuenta}</p>
                )}
            </div>
        </div>
    )

    // ==================== RENDER STEP ====================
    const renderStep = () => {
        switch (currentStep) {
            case 1: return renderStep1()
            case 2: return renderStep2()
            case 3: return renderStep3()
            case 4: return renderStep4()
            case 5: return renderStep5()
            default: return null
        }
    }

    // ==================== MAIN RETURN ====================
    return (
        <>
            <div className="min-h-screen  bg-gradient-to-br from-gray-100 to-gray-200 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* ==================== HEADER ==================== */}
                <div className='bg-white'>
                    <div className="  mb-6 pb-6  dark:border-orbit-border">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Logo - Izquierda */}
                            <div className="flex-shrink-0">
                                <img
                                    src={coopserpLogo}
                                    alt="Coopserp Logo"
                                    className="h-20 w-auto object-contain sm:h-24 md:h-28"
                                />
                            </div>

                            {/* Título - Centro */}
                            <div className="text-center flex-1">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100 uppercase">
                                    Formato Vinculación Virtual
                                </h1>
                                <p className="text-sm md:text-base text-red-500 font-bold dark:text-red-400 font-medium">
                                    FASE 1 - Registrar Datos
                                </p>
                            </div>

                            {/* Fecha y hora - Derecha */}
                            <div className="text-right flex-shrink-0 p-2">
                                <p className="text-md font-bold text-gray-700 dark:text-slate-300">
                                    {currentDateTime}
                                </p>
                                <p className="text-xs font-bold text-gray-500 dark:text-slate-400">
                                    Hora actual
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="w-full max-w-7xl mx-auto">
                    <div className="bg-white rounded-lg border border-gray-200 dark:border-orbit-border p-4 sm:p-6">

                        {/* Stepper */}
                        {renderStepIndicator()}

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="bg-gray-50 dark:bg-orbit-surface2/30 rounded-lg border border-gray-200 dark:border-orbit-border p-3 sm:p-4 mt-4 sm:mt-6">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3 sm:mb-4">
                                    {currentStep}. {STEPS[currentStep - 1].label}
                                </h3>
                                {renderStep()}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-orbit-border">
                                <button
                                    type="button"
                                    onClick={handlePrevStep}
                                    disabled={currentStep === 1}
                                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-orbit-surface2 border border-gray-300 dark:border-orbit-border rounded-lg hover:bg-gray-50 dark:hover:bg-orbit-surface3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Anterior
                                </button>

                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(initialFormData)
                                            setErrors({})
                                            setValidationPassed(false)
                                            setCurrentStep(1)
                                        }}
                                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-orbit-surface2 border border-gray-300 dark:border-orbit-border rounded-lg hover:bg-gray-50 dark:hover:bg-orbit-surface3 transition-colors"
                                    >
                                        Cancelar
                                    </button>

                                    {currentStep < STEPS.length ? (
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-700/80 transition-colors"
                                        >
                                            Siguiente →
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Enviando...' : 'Enviar Formulario'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

            </div>

            <ModalSolicitudEnviada
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
            />
        </>
    )
}

export default AffiliationForm