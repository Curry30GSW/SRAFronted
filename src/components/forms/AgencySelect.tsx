import React, { useMemo, useState } from 'react'
import { Search, ChevronDown, MapPin } from 'lucide-react'
import { cn } from '../../utils/cn'
import { AGENCIAS, Agencia } from '../../constants/agencias'

interface AgencySelectProps {
    label?: string
    value: string
    onChange: (codigo: string) => void
    error?: string
    required?: boolean
    placeholder?: string
}

export const AgencySelect: React.FC<AgencySelectProps> = ({
    label = 'Agencia a la que desea pertenecer',
    value,
    onChange,
    error,
    required = true,
    placeholder = 'Busca por ciudad o código…',
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')

    const seleccionada = useMemo(
        () => AGENCIAS.find(a => a.codigo === value),
        [value]
    )

    const filtradas = useMemo(() => {
        if (!search.trim()) return AGENCIAS
        const term = search.trim().toLowerCase()
        return AGENCIAS.filter(
            a =>
                a.nombre.toLowerCase().includes(term) ||
                a.codigo.includes(term) ||
                a.direccion.toLowerCase().includes(term)
        )
    }, [search])

    const handleSelect = (agencia: Agencia) => {
        onChange(agencia.codigo)
        setIsOpen(false)
        setSearch('')
    }

    return (
        <div className="w-full">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-300 mb-1.5">
                {label}
            </label>

            <div className="relative">
                {/* Trigger */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'w-full h-10 rounded-lg border bg-white dark:bg-orbit-surface2 px-3 text-sm text-left',
                        'flex items-center justify-between gap-2',
                        'focus:border-orbit-primary focus:ring-1 focus:ring-orbit-primary/30 outline-none',
                        error
                            ? 'border-red-400 dark:border-red-500'
                            : 'border-gray-300 dark:border-orbit-border'
                    )}
                >
                    {seleccionada ? (
                        <div className="flex flex-col min-w-0">
                            <span className="text-gray-900 dark:text-slate-200 font-medium truncate">
                                {seleccionada.codigo} — {seleccionada.nombre}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-slate-500 truncate">
                                {seleccionada.direccion}
                            </span>
                        </div>
                    ) : (
                        <span className="text-gray-400 dark:text-slate-500">
                            {placeholder}
                        </span>
                    )}
                    <ChevronDown
                        className={cn(
                            'w-4 h-4 text-gray-400 flex-shrink-0 transition-transform',
                            isOpen && 'rotate-180'
                        )}
                    />
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <>
                        {/* Overlay para cerrar al hacer click afuera */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />

                        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-green-surface2
                            border border-gray-200 dark:border-green-border rounded-lg
                            shadow-xl max-h-72 overflow-hidden flex flex-col">

                            {/* Buscador */}
                            <div className="p-2 border-b border-gray-200 dark:border-green-border flex-shrink-0">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        autoFocus
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar agencia…"
                                        className="w-full h-9 pl-9 pr-3 rounded-md border border-gray-200 dark:border-green-border
                                            bg-white dark:bg-orbit-surface3 text-sm
                                            text-gray-900 dark:text-slate-200 outline-none
                                            focus:border-orbit-green"
                                    />
                                </div>
                            </div>

                            {/* Lista */}
                            <div className="overflow-y-auto">
                                {filtradas.length === 0 ? (
                                    <div className="px-3 py-6 text-center text-sm text-gray-400 dark:text-slate-500">
                                        Sin resultados
                                    </div>
                                ) : (
                                    filtradas.map(a => (
                                        <button
                                            key={a.codigo}
                                            type="button"
                                            onClick={() => handleSelect(a)}
                                            className={cn(
                                                'w-full px-3 py-2 text-left flex items-start gap-2 transition-colors',
                                                'hover:bg-gray-50 dark:hover:bg-orbit-surface3',
                                                value === a.codigo && 'bg-green-50 dark:bg-green-900/20'
                                            )}
                                        >
                                            <MapPin className="w-4 h-4 mt-0.5 text-green-700 dark:text-green-400 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                                                        {a.codigo} - {a.nombre}
                                                    </span>
                                                </div>
                                                <p className="text-[13px] text-gray-500 dark:text-slate-500 mt-0.5 leading-snug">
                                                    {a.direccion}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500 dark:text-orbit-danger mt-1">
                    {error}
                </p>
            )}
        </div>
    )
}