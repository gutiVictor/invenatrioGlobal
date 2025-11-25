import { useState, useEffect } from 'react';
import { Calendar, User, Wrench, DollarSign, Filter, Plus } from 'lucide-react';
import api from '../../services/api';

const MaintenanceHistory = ({ productId, onScheduleClick }) => {
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ status: '', type_id: '' });
    const [types, setTypes] = useState([]);

    useEffect(() => {
        fetchMaintenanceTypes();
        fetchMaintenances();
    }, [productId, filter]);

    const fetchMaintenanceTypes = async () => {
        try {
            const response = await api.get('/maintenance/types');
            if (response.data.success) {
                setTypes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching maintenance types:', error);
        }
    };

    const fetchMaintenances = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter.status) params.append('status', filter.status);
            if (filter.type_id) params.append('type_id', filter.type_id);

            const response = await api.get(`/maintenance/product/${productId}?${params}`);
            if (response.data.success) {
                setMaintenances(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching maintenances:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            abierto: 'bg-blue-100 text-blue-800',
            en_proceso: 'bg-yellow-100 text-yellow-800',
            finalizado: 'bg-green-100 text-green-800',
            cancelado: 'bg-red-100 text-red-800'
        };
        const labels = {
            abierto: 'Abierto',
            en_proceso: 'En Proceso',
            finalizado: 'Finalizado',
            cancelado: 'Cancelado'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-secondary-100 text-secondary-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            baja: 'bg-secondary-100 text-secondary-600',
            media: 'bg-blue-100 text-blue-600',
            alta: 'bg-orange-100 text-orange-600',
            critica: 'bg-red-100 text-red-600'
        };
        const labels = {
            baja: 'Baja',
            media: 'Media',
            alta: 'Alta',
            critica: 'Crítica'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[priority] || 'bg-secondary-100 text-secondary-800'}`}>
                {labels[priority] || priority}
            </span>
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('es-ES');
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-secondary-500" />
                    <span className="text-sm font-medium text-secondary-700">Filtros:</span>
                </div>
                <select
                    value={filter.status}
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    className="input-field py-1.5"
                >
                    <option value="">Todos los estados</option>
                    <option value="abierto">Abierto</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
                <select
                    value={filter.type_id}
                    onChange={(e) => setFilter({ ...filter, type_id: e.target.value })}
                    className="input-field py-1.5"
                >
                    <option value="">Todos los tipos</option>
                    {types.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
                <button onClick={onScheduleClick} className="btn-primary ml-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Programar Mantenimiento
                </button>
            </div>

            {/* Table */}
            {maintenances.length === 0 ? (
                <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-secondary-900">No hay mantenimientos registrados</h3>
                    <p className="text-secondary-500 mb-4">Comienza programando el primer mantenimiento para este producto.</p>
                    <button onClick={onScheduleClick} className="btn-secondary">Programar Mantenimiento</button>
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
                                    Serial
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                    Prioridad
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                    Fecha Programada
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                    Técnico
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                    Costo Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-secondary-200">
                            {maintenances.map((maintenance) => {
                                const totalCost = parseFloat(maintenance.cost_parts || 0) + parseFloat(maintenance.cost_labor || 0);
                                return (
                                    <tr key={maintenance.id} className="hover:bg-secondary-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-secondary-900">
                                            {maintenance.code}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-700">
                                            {maintenance.asset?.serial || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-700">
                                            <div className="flex items-center gap-2">
                                                <Wrench className="h-4 w-4 text-secondary-400" />
                                                {maintenance.type?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {getStatusBadge(maintenance.status)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {getPriorityBadge(maintenance.priority)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-700">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-secondary-400" />
                                                {formatDate(maintenance.planned_date)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-700">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-secondary-400" />
                                                {maintenance.technician?.name || 'Sin asignar'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary-700">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-secondary-400" />
                                                ${totalCost.toFixed(2)}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MaintenanceHistory;
