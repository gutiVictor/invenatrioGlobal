import { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Building2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../services/api';
import WarehouseForm from '../../components/Warehouses/WarehouseForm';

const WarehouseList = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('true');

    useEffect(() => {
        fetchWarehouses();
    }, [filterActive]);

    const fetchWarehouses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                active: filterActive,
                search: searchTerm
            });
            const response = await api.get(`/warehouses?${params}`);
            if (response.data.success) {
                setWarehouses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchWarehouses();
    };

    const handleEdit = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setShowForm(true);
    };

    const handleToggleActive = async (warehouse) => {
        try {
            await api.put(`/warehouses/${warehouse.id}`, {
                active: !warehouse.active
            });
            fetchWarehouses();
        } catch (error) {
            console.error('Error toggling warehouse status:', error);
        }
    };

    const handleFormSuccess = () => {
        fetchWarehouses();
        setShowForm(false);
        setSelectedWarehouse(null);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setSelectedWarehouse(null);
    };

    const getTypeBadge = (type) => {
        const badges = {
            CENTRAL: 'bg-blue-100 text-blue-800',
            DAÑADOS: 'bg-red-100 text-red-800',
            TRANSITO: 'bg-yellow-100 text-yellow-800',
            VIRTUAL: 'bg-purple-100 text-purple-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[type] || 'bg-secondary-100 text-secondary-800'}`}>
                {type}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Almacenes</h2>
                    <p className="text-secondary-500 mt-1">Gestión de ubicaciones y bodegas</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Almacén
                </button>
            </div>

            {/* Search and Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar por nombre, código o ciudad..."
                                className="input-field pl-10"
                            />
                        </div>
                        <button type="submit" className="btn-secondary">
                            Buscar
                        </button>
                    </form>
                    <select
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value)}
                        className="input-field w-auto"
                    >
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                        <option value="all">Todos</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : warehouses.length === 0 ? (
                    <div className="text-center py-12">
                        <Building2 className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-secondary-900">No hay almacenes</h3>
                        <p className="text-secondary-500 mb-4">Comienza creando tu primer almacén</p>
                        <button onClick={() => setShowForm(true)} className="btn-primary">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Almacén
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Código
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Tipo
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Ubicación
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-secondary-200">
                                {warehouses.map((warehouse) => (
                                    <tr key={warehouse.id} className="hover:bg-secondary-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-secondary-900">
                                            {warehouse.code}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-secondary-900">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-secondary-400" />
                                                {warehouse.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {getTypeBadge(warehouse.warehouse_type)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-secondary-700">
                                            {warehouse.city || warehouse.address ? (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-secondary-400" />
                                                    <span>{warehouse.city || ''}{warehouse.city && warehouse.state ? ', ' : ''}{warehouse.state || ''}</span>
                                                </div>
                                            ) : (
                                                <span className="text-secondary-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${warehouse.active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {warehouse.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(warehouse)}
                                                    className="text-primary-600 hover:text-primary-900"
                                                    title="Editar"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(warehouse)}
                                                    className={`${warehouse.active
                                                            ? 'text-red-600 hover:text-red-900'
                                                            : 'text-green-600 hover:text-green-900'
                                                        }`}
                                                    title={warehouse.active ? 'Desactivar' : 'Activar'}
                                                >
                                                    {warehouse.active ? (
                                                        <ToggleRight className="h-5 w-5" />
                                                    ) : (
                                                        <ToggleLeft className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            <WarehouseForm
                isOpen={showForm}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
                warehouse={selectedWarehouse}
            />
        </div>
    );
};

export default WarehouseList;
