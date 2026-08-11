import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    itemsPerPageOptions?: number[];
    showItemsPerPageSelector?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    itemsPerPageOptions = [5, 10, 15, 20, 25, 50],
    showItemsPerPageSelector = true
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (onItemsPerPageChange) {
            onItemsPerPageChange(Number(event.target.value));
        }
    };

    if (totalItems === 0) return null;

    return (
        <div className="border-t border-gray-100 dark:border-white/[0.05] px-5 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Mostrando {startIndex} - {endIndex} de {totalItems} registros
                    </div>

                    {showItemsPerPageSelector && onItemsPerPageChange && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 dark:text-gray-400">Mostrar</span>
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 
                                        shadow-theme-xs focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300/10 
                                        dark:border-gray-700 dark:bg-white/[0.03] dark:text-white/90 dark:focus:border-blue-800"
                            >
                                {itemsPerPageOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <span className="text-sm text-gray-700 dark:text-gray-400">registros</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 
                                hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                                dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]"
                    >
                        ← Anterior
                    </button>

                    <div className="flex items-center gap-1">
                        {renderPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => typeof page === 'number' && handlePageChange(page)}
                                disabled={page === '...'}
                                className={`px-3 py-1 text-sm rounded-lg ${page === currentPage
                                    ? 'bg-blue-600 text-white'
                                    : page === '...'
                                        ? 'cursor-default text-gray-400'
                                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 
                                hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
                                dark:border-gray-700 dark:bg-white/[0.05] dark:text-gray-200 dark:hover:bg-white/[0.1]"
                    >
                        Siguiente →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;