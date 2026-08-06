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

]

export const CitySelect = forwardRef<HTMLDivElement, CitySelectProps>(
    ({ label, value, onChange, error, placeholder = 'Buscar ciudad...', required }, ref) => {
        const [isOpen, setIsOpen] = useState(false)
        const [searchTerm, setSearchTerm] = useState('')
        const [filteredCities, setFilteredCities] = useState(COLOMBIAN_CITIES)
        const wrapperRef = useRef<HTMLDivElement>(null)

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
            <div className="w-full" ref={wrapperRef}>
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