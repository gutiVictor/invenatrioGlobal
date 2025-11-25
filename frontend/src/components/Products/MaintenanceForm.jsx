import { useState, useEffect } from 'react';
import { X, Calendar, User, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const MaintenanceForm = ({ isOpen, onClose, productId, onSuccess }) => {
    const [formData, setFormData] = useState({
        asset_id: '',
        type_id: '',
        description: '',
        priority: 'media',
        planned_date: '',
        technician_id: '',
        provider: '',
        notes: ''
    });
    const [serialNumbers, setSerialNumbers] = useState([]);
    const [maintenanceTypes, setMaintenanceTypes] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchSerialNumbers();
            fetchMaintenanceTypes();
            fetchTechnicians();
        }
    }, [isOpen, productId]);

    const fetchSerialNumbers = async () => {
        try {
            const response = await api.get(`/serial-numbers/product/${productId}`);
            if (response.data.success) {
                setSerialNumbers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching serial numbers:', error);
        }
    };

    const fetchMaintenanceTypes = async () => {
        try {
            const response = await api.get('/maintenance/types');
            if (response.data.success) {
                setMaintenanceTypes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching maintenance types:', error);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const response = await api.get('/auth/users');
            if (response.data.success) {
                setTechnicians(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.asset_id) {
            setError('Debe seleccionar un número de serie');
            return;
        }
        if (!formData.type_id) {
            setError('Debe seleccionar un tipo de mantenimiento');
            return;
        }
        if (!formData.planned_date) {
            setError('Debe especificar una fecha programada');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/maintenance', formData);
            if (response.data.success) {
                onSuccess();
                handleClose();
            }
        } catch (error) {
            console.error('Error creating maintenance:', error);
            setError(error.response?.data?.message || 'Error al programar mantenimiento');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            asset_id: '',
            type_id: '',
            description: '',
            priority: 'media',
            planned_date: '',
            technician_id: '',
            provider: '',
            notes: ''
        });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-secondary-500 bg-opacity-75" onClick={handleClose}></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
                        <h3 className="text-lg font-medium text-secondary-900">Programar Mantenimiento</h3>
                        <button onClick={handleClose} className="text-secondary-400 hover:text-secondary-500">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 py-4">
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-red-800">{error}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Serial Number */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Número de Serie *
                                </label>
                                <select
                                    name="asset_id"
                                    value={formData.asset_id}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="">Seleccionar...</option>
                                    {serialNumbers.map(sn => (
                                        <option key={sn.id} value={sn.id}>
                                            {sn.serial} - {sn.status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Maintenance Type */}
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Tipo de Mantenimiento *
                                </label>
                                <select
                                    name="type_id"
                                    value={formData.type_id}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="">Seleccionar...</option>
                                    {maintenanceTypes.map(type => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Prioridad
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="baja">Baja</option>
                                    <option value="media">Media</option>
                                    <option value="alta">Alta</option>
                                    <option value="critica">Crítica</option>
                                </select>
                            </div>

                            {/* Planned Date */}
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Fecha Programada *
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="planned_date"
                                        value={formData.planned_date}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Technician */}
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Técnico Asignado
                                </label>
                                <select
                                    name="technician_id"
                                    value={formData.technician_id}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="">Sin asignar</option>
                                    {technicians.map(tech => (
                                        <option key={tech.id} value={tech.id}>
                                            {tech.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Provider */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Proveedor de Servicio
                                </label>
                                <input
                                    type="text"
                                    name="provider"
                                    value={formData.provider}
                                    onChange={handleChange}
                                    placeholder="Nombre del proveedor externo (opcional)"
                                    className="input-field"
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Descripción breve del mantenimiento"
                                    className="input-field"
                                />
                            </div>

                            {/* Notes */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Notas Adicionales
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Notas adicionales o instrucciones especiales"
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Programando...' : 'Programar Mantenimiento'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceForm;
