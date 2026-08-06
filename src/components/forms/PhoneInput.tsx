import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Input } from '../ui/Input'

interface PhoneInputProps {
    label: string
    values: string[]
    onChange: (values: string[]) => void
    error?: string
    required?: boolean
    placeholder?: string
}

export const PhoneInput = ({
    label,
    values,
    onChange,
    error,
    required = false,
    placeholder = "Ingrese número de teléfono",
    ...props
}: PhoneInputProps) => {
    const [newPhone, setNewPhone] = useState('')

    const addPhone = () => {
        if (newPhone.trim() && !values.includes(newPhone.trim())) {
            onChange([...values, newPhone.trim()])
            setNewPhone('')
        }
    }

    const removePhone = (index: number) => {
        onChange(values.filter((_, i) => i !== index))
    }

    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-2">
                <Input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder={placeholder}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            addPhone()
                        }
                    }}
                    className="flex-1"
                />
                <button
                    type="button"
                    onClick={addPhone}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Agregar
                </button>
            </div>
            {values.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {values.map((phone, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-orbit-primary/10 dark:bg-orbit-primary/20 text-gray-700 dark:text-slate-200 rounded-full text-sm"
                        >
                            {phone}
                            <button
                                type="button"
                                onClick={() => removePhone(index)}
                                className="text-gray-400 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 ml-1 transition-colors"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
            {error && <p className="text-sm text-red-500 dark:text-orbit-danger mt-1.5">{error}</p>}
        </div>
    )
}