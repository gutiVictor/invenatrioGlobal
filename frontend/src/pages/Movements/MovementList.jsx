import { useState, useEffect } from 'react';
import { Plus, Filter, Package, ArrowRight, Calendar, User, FileText } from 'lucide-react';
import api from '../../services/api';
import MovementForm from '../../components/Movements/MovementForm';

const MovementList = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        product_id: '',
        warehouse_id: '',
        start_date: '',
        end_date: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchMovements();
    }, [filters, pagination.page]);

    const fetchMovements = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
            });

            const response = await api.get(`/movements?${params}`);
            if (response.data.success) {
                setMovements(response.data.data.movements);
                setPagination(prev => ({
                    ...prev,
                    ...response.data.data.pagination
                }));
            }
        } catch (error) {
            console.error('Error fetching movements:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeBadge = (type) => {
        const badges = {
            entrada: 'bg-green-100 text-green-800',
            salida: 'bg-red-100 text-red-800',
            transferencia: 'bg-blue-100 text-blue-800',
            ajuste: 'bg-yellow-100 text-yellow-800'
        };
        const labels = {
            entrada: 'Entrada',
            salida: 'Salida',
            transferencia: 'Transferencia',
            ajuste: 'Ajuste'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[type] || 'bg-secondary-100 text-secondary-800'}`}>
                {labels[type] || type}
            </span>
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('es-ES');
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            product_id: '',
            warehouse_id: '',
            start_date: '',
            end_date: ''
        });
    };

    const handleFormSuccess = () => {
        fetchMovements();
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Movimientos de Inventario</h2>
                    <p className="text-secondary-500 mt-1">Registro de entradas, salidas, transferencias y ajustes</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Movimiento
                </button>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4 text-secondary-500" />
                    <span className="text-sm font-medium text-secondary-700">Filtros</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="input-field"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="entrada">Entrada</option>
                        <option value="salida">Salida</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="ajuste">Ajuste</option>
                    </select>
                    <input
                        type="date"
                        name="start_date"
                        value={filters.start_date}
                        onChange={handleFilterChange}
                        placeholder="Fecha inicio"
                        className="input-field"
                    />
                    <input
                        type="date"
                        name="end_date"
                        value={filters.end_date}
                        onChange={handleFilterChange}
                        placeholder="Fecha fin"
                        className="input-field"
                    />
                    <button onClick={clearFilters} className="btn-secondary">
                        Limpiar Filtros
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : movements.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-secondary-900">No hay movimientos registrados</h3>
                        <p className="text-secondary-500 mb-4">Comienza registrando el primer movimiento de inventario</p>
                        <button onClick={() => setShowForm(true)} className="btn-primary">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Movimiento
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                            Producto
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                            Cantidad
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                            Almacén
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                            Referencia
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                            Usuario
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-secondary-200">
                                    {movements.map((movement) => (
                                        <tr key={movement.id} className="hover:bg-secondary-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-700">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-secondary-400" />
                                                    {formatDate(movement.movement_date)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {getTypeBadge(movement.type)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-secondary-900">
                                                <div className="flex items-center gap-2">
                                                    <Package className="h-4 w-4 text-secondary-400" />
                                                    <div>
                                                        <div className="font-medium">{movement.product?.name}</div>
                                                        <div className="text-xs text-secondary-500">{movement.product?.sku}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-secondary-900">
                                                {Math.abs(movement.quantity)} {movement.product?.unit}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-secondary-700">
                                                {movement.type === 'transferencia' ? (
                                                    <div className="flex items-center gap-1">
                                                        <span>{movement.warehouse?.code}</span>
                                                        <ArrowRight className="h-3 w-3" />
                                                        <span>{movement.warehouseDest?.code}</span>
                                                    </div>
                                                ) : (
                                                    movement.warehouse?.code
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-700">
                                                {movement.reference ? (
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-secondary-400" />
                                                        {movement.reference}
                                                    </div>
                                                ) : (
                                                    <span className="text-secondary-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-700">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-secondary-400" />
                                                    {movement.creator?.name}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="px-4 py-3 bg-secondary-50 border-t border-secondary-200 flex items-center justify-between">
                                <div className="text-sm text-secondary-700">
                                    Mostrando página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Form Modal */}
            <MovementForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
};

export default MovementList;
