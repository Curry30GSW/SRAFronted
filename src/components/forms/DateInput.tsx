import { forwardRef, useState } from 'react'
import { Input } from '../ui/Input'

interface DateInputProps {
    label: string
    value: string
    onChange: (value: string) => void
    error?: string
    required?: boolean
}


const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    const [year, month, day] = dateString.split('-')
    const monthNames: Record<string, string> = {
        '01': 'Ene',
        '02': 'Feb',
        '03': 'Mar',
        '04': 'Abr',
        '05': 'May',
        '06': 'Jun',
        '07': 'Jul',
        '08': 'Ago',
        '09': 'Sep',
        '10': 'Oct',
        '11': 'Nov',
        '12': 'Dic'
    }

    const monthAbbr = monthNames[month] || month
    return `${day}/${monthAbbr}/${year}`
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
    ({ label, value, onChange, error, required }, ref) => {
        const [displayDate, setDisplayDate] = useState('')

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value
            onChange(newValue)

            if (newValue) {
                setDisplayDate(formatDate(newValue))
            } else {
                setDisplayDate('')
            }
        }

        return (
            <div className="w-full">
                <Input
                    ref={ref}
                    type="date"
                    label={label}
                    value={value}
                    onChange={handleChange}
                    error={error}
                    required={required}
                />
                {displayDate && (
                    <p className="text-xs text-blue-800 font-bold mt-1 dark:text-blue-200 ">
                        Fecha seleccionada: {displayDate}
                    </p>
                )}
            </div>
        )
    }
)

DateInput.displayName = 'DateInput'