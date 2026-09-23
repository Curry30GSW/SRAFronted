import { useAuth } from '@/context/AuthContext'
import { GestionLinksAfiliacion } from '../components/GestionLinksAfiliacion'
import { useState, useEffect } from 'react'
import { FetchDynamic } from '../../components/Api/FetchDynamic'

const LinksAfiliacionPage = () => {
    const { user, nombre } = useAuth()
    const [usuarioId, setUsuarioId] = useState<number | null>(null)
    const [usuarioNombre, setUsuarioNombre] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    // ✅ Obtener el ID del usuario autenticado
    useEffect(() => {
        const obtenerUsuarioId = async () => {
            try {
                const response = await FetchDynamic('/auth/me')
                if (response.ok) {
                    const data = await response.json()
                    setUsuarioId(data.data?.id_usuario || null)
                    setUsuarioNombre(data.data?.nombre || '')
                }
            } catch (error) {
                console.error('Error obteniendo usuario:', error)
            } finally {
                setLoading(false)
            }
        }

        obtenerUsuarioId()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!usuarioId) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">No se pudo obtener la información del usuario</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full w-full p-4 md:p-6">
            <GestionLinksAfiliacion
                usuarioId={usuarioId}
                usuarioNombre={user || 'Usuario'}
            />
        </div>
    )
}

export default LinksAfiliacionPage