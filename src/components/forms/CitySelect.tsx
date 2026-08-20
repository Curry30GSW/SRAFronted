import { useState, useRef, useEffect, forwardRef } from 'react'
import { Input } from '../ui/Input'

interface CitySelectProps {
    label: string
    value: string
    onChange: (value: string) => void
    error?: string
    placeholder?: string
    required?: boolean
}

const COLOMBIAN_CITIES = [
    // Capitales de departamento (las que ya tenías)
    'Bogotá D.C.',
    'Medellín',
    'Cali',
    'Barranquilla',
    'Cartagena',
    'Cúcuta',
    'Bucaramanga',
    'Pereira',
    'Santa Marta',
    'Ibagué',
    'Pasto',
    'Manizales',
    'Neiva',
    'Villavicencio',
    'Armenia',
    'Popayán',
    'Sincelejo',
    'Montería',
    'Valledupar',
    'Riohacha',
    'Quibdó',
    'Tunja',
    'Florencia',
    'Leticia',
    'Yopal',
    'Mocoa',
    'Puerto Carreño',
    'San Andrés',
    'Mitú',
    'Inírida',

    // Ciudades y municipios importantes adicionales
    'Soacha',
    'Bello',
    'Itagüí',
    'Envigado',
    'Floridablanca',
    'Girón',
    'Piedecuesta',
    'Tuluá',
    'Buga',
    'Cartago',
    'Dosquebradas',
    'La Dorada',
    'Girardot',
    'Melgar',
    'Espinal',
    'Sogamoso',
    'Duitama',
    'Chiquinquirá',
    'Turbo',
    'Apartadó',
    'Rionegro',
    'La Ceja',
    'Marinilla',
    'Caldas (Antioquia)',
    'Sabaneta',
    'Copacabana',
    'Girardota',
    'Barbosa (Antioquia)',
    'Yumbo',
    'Jamundí',
    'Palmira',
    'Buenaventura',
    'Tumaco',
    'Ipiales',
    'Túquerres',
    'Maicao',
    'Uribia',
    'San Juan del Cesar',
    'Arauca',
    'Saravena',
    'Tame',
    'Arauquita',
    'Fortul',
    'Barrancabermeja',
    'Puerto Berrío',
    'Puerto Nare',
    'Ocaña',
    'Pamplona',
    'Villa del Rosario',
    'Los Patios',
    'Aguachica',
    'El Carmen de Bolívar',
    'Magangué',
    'San Benito Abad',
    'Lorica',
    'Sahagún',
    'Cereté',
    'Montelíbano',
    'Planeta Rica',
    'Ayapel',
    'Ciénaga de Oro',
    'Chinú',
    'San Pelayo',
    'Puerto Escondido',
    'Monitos',
    'Santa Lucía',
    'Santa Rosa de Osos',
    'Sonsón',
    'Abejorral',
    'El Carmen de Viboral',
    'Ciudad Bolívar (Antioquia)',
    'San Carlos (Antioquia)',
    'Puerto Boyacá',
    'Santa Rosa de Cabal',
    'Quimbaya',
    'Montenegro',
    'Circasia',
    'Salento',
    'Filandia',
    'Calarcá',
    'Caicedonia',
    'Sevilla',
    'Zarzal',
    'Pitalito',
    'San Agustín',
    'Garzón',
    'La Plata',
    'Campoalegre',
    'Rivera',
    'Palermo',
    'Aipe',
    'Santa María (Huila)',
    'Acacías',
    'Granada (Meta)',
    'San Martín (Meta)',
    'Vista Hermosa',
    'Puerto Gaitán',
    'Puerto Lleras',
    'Puerto Rico (Meta)',
    'Cumaribo',
    'Tame',
    'Puerto Rondón',
    'San José del Guaviare',
    'Calamar',
    'El Retorno',
    'Miraflores (Guaviare)',
    'Puerto Leguízamo',
    'Caquetá',
    'Cartagena del Chairá',
    'San Vicente del Caguán',
    'La Macarena',
    'Mesetas',
    'Uribe',
    'Santa Bárbara (Meta)',
    'San Pedro (Meta)',
    'Cubarral',
    'El Dorado (Meta)',
    'Coveñas',
    'Tolú',
    'San Onofre',
    'Palmito',
    'Sampués',
    'Corozal',
    'Morroa',
    'Betulia (Sucre)',
    'Majagual',
    'Guaranda',
    'Sucre (Sucre)',
    'Lorica',
    'Cotorra',
    'San Antero',
    'Puerto Libertador',
    'Tierralta',
    'Valencia (Córdoba)',
    'Canalete',
    'Los Córdobas',
    'Arboletes',
    'San Pedro de Urabá',
    'Necoclí',
    'Acandí',
    'Riosucio (Chocó)',
    'Istmina',
    'Condoto',
    'Tadó',
    'Bagadó',
    'Litoral del San Juan',
    'Cértegui',
    'Nóvita',
    'Pizarro',
    'Buenavista (Quindío)',
    'La Tebaida',
    'Pijao',
    'Génova',
    'Córdoba (Quindío)',
    'Baraya',
    'Tello',
    'Algeciras',
    'Gigante',
    'Hobo',
    'Íquira',
    'Nátaga',
    'Paicol',
    'Tarqui',
    'Tesalia',
    'Teruel',
    'Yaguará',
    'Elías',
    'Oporapa',
    'Saladoblanco',
    'Timaná',
    'Acevedo',
    'Suaza',
    'Guadalupe (Huila)',
    'Santa Rosa (Huila)',
    'Palestina (Huila)',
    'Isnos',
    'San José de Isnos',

].sort()

export const CitySelect = forwardRef<HTMLDivElement, CitySelectProps>(
    ({ label, value, onChange, error, placeholder = 'Buscar ciudad...', required }, ref) => {
        const [isOpen, setIsOpen] = useState(false)
        const [searchTerm, setSearchTerm] = useState('')
        const [filteredCities, setFilteredCities] = useState(COLOMBIAN_CITIES)
        const wrapperRef = useRef<HTMLDivElement>(null)

        const setRefs = (node: HTMLDivElement | null) => {
            wrapperRef.current = node
            if (typeof ref === 'function') {
                ref(node)
            } else if (ref) {
                ref.current = node
            }
        }

        useEffect(() => {
            const filtered = COLOMBIAN_CITIES.filter(city =>
                city.toLowerCase().includes(searchTerm.toLowerCase())
            )
            setFilteredCities(filtered)
        }, [searchTerm])

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }, [])

        const handleSelect = (city: string) => {
            onChange(city)
            setSearchTerm(city)
            setIsOpen(false)
        }

        return (
            <div className="w-full" ref={setRefs}>
                <div className="relative">
                    <Input
                        label={label}
                        value={searchTerm || value}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setIsOpen(true)
                            if (e.target.value === '') {
                                onChange('')
                            }
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={placeholder}
                        error={error}
                        required={required}
                    />
                    {isOpen && filteredCities.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-lg border border-orbit-border bg-orbit-surface2 shadow-lg">
                            {filteredCities.map((city) => (
                                <div
                                    key={city}
                                    className="px-3 py-2 text-sm text-slate-200 hover:bg-orbit-primary/20 cursor-pointer transition-colors"
                                    onClick={() => handleSelect(city)}
                                >
                                    {city}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }
)

CitySelect.displayName = 'CitySelect'