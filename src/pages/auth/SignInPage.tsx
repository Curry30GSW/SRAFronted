import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Lock, Eye, EyeOff, Building2 } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'
import Swal from 'sweetalert2'
import { useAuth } from '../../context/AuthContext'

// ✅ Importar la imagen directamente
import backgroundImage from '../../../public/images/logo/login.png'

function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockTime, setBlockTime] = useState(0)

  const navigate = useNavigate()
  const captchaRef = useRef<any>(null)
  const { login, authenticated } = useAuth()

  // ✅ Redirigir si ya está autenticado
  useEffect(() => {
    if (authenticated) {
      navigate('/asociados')
    }
  }, [authenticated, navigate])

  // Manejar bloqueo del botón
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    if (isBlocked && blockTime > 0) {
      interval = setInterval(() => {
        setBlockTime(prev => {
          if (prev <= 1) {
            setIsBlocked(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isBlocked, blockTime])

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token || '')
  }

  const bloquearBotonLogin = (segundos: number) => {
    setIsBlocked(true)
    setBlockTime(segundos)

    // Resetear captcha
    if (captchaRef.current) {
      captchaRef.current.reset()
    }
    setCaptchaToken('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validaciones
    if (!user.trim() || !password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos vacíos',
        text: 'Por favor ingrese ambos campos.'
      })
      setLoading(false)
      return
    }

    if (!captchaToken) {
      Swal.fire({
        icon: 'warning',
        title: 'Captcha requerido',
        text: 'Por favor verifique que no es un robot.'
      })
      setLoading(false)
      return
    }

    try {
      const result = await login(user, password, captchaToken)

      if (!result.success) {
        // Verificar si es error de bloqueo
        if (result.message.includes('segundos')) {
          const match = result.message.match(/en (\d+) segundos/)
          if (match) {
            const segundos = parseInt(match[1], 10)
            bloquearBotonLogin(segundos)
          }
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.message
        })
        setLoading(false)
        return
      }

      // ✅ Login exitoso
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: result.message,
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate('/asociados')
      })

    } catch (error) {
      console.error('Error en login:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar iniciar sesión'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Imagen de fondo usando import */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Contenido del login */}
      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl p-8"
        >
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Building2 className="w-9 h-9 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              COOPSERP - VINCULACION
            </h1>
            <p className="text-white/70 text-sm">
              Inicia sesión para continuar
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="Nombre de usuario"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                  required
                  disabled={loading || isBlocked}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                  required
                  disabled={loading || isBlocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  disabled={loading || isBlocked}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ✅ reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={captchaRef}
                sitekey="6LcCHpYrAAAAAPF4CUkS4fUfXcE4rekGxIurhsk1"
                onChange={handleCaptchaChange}
                theme="light"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-green-500 focus:ring-2 focus:ring-green-500/50"
                />
                <span className="text-sm text-white/70">Recordarme</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || isBlocked || !captchaToken}
              className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBlocked ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  </svg>
                  Bloqueado ({blockTime}s)
                </>
              ) : loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default SignInPage