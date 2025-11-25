import { useState, useEffect } from 'react';
import { X, Building2, MapPin, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const WarehouseForm = ({ isOpen, onClose, onSuccess, warehouse }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        warehouse_type: 'CENTRAL',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        phone: '',
        email: '',
        active: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (warehouse) {
            setFormData({
                name: warehouse.name || '',
                code: warehouse.code || '',
                warehouse_type: warehouse.warehouse_type || 'CENTRAL',
                address: warehouse.address || '',
                city: warehouse.city || '',
                state: warehouse.state || '',
                postal_code: warehouse.postal_code || '',
                phone: warehouse.phone || '',
                email: warehouse.email || '',
                active: warehouse.active !== undefined ? warehouse.active : true
            });
        } else {
            setFormData({
                name: '',
                code: '',
                warehouse_type: 'CENTRAL',
                address: '',
                city: '',
                state: '',
                postal_code: '',
                phone: '',
                email: '',
                active: true
            });
        }
        setError('');
    }, [warehouse, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.code) {
            setError('Nombre y código son requeridos');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (warehouse) {
                // Update
                await api.put(`/warehouses/${warehouse.id}`, formData);
            } else {
                // Create
                await api.post('/warehouses', formData);
            }
            onSuccess();
            handleClose();
        } catch (error) {
            console.error('Error saving warehouse:', error);
            setError(error.response?.data?.message || 'Error al guardar el almacén');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: '',
            code: '',
            warehouse_type: 'CENTRAL',
            address: '',
            city: '',
            state: '',
            postal_code: '',
            phone: '',
            email: '',
            active: true
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
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary-600" />
                            <h3 className="text-lg font-medium text-secondary-900">
                                {warehouse ? 'Editar Almacén' : 'Nuevo Almacén'}
                            </h3>
                        </div>
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
                            {/* Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Nombre del Almacén *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="Almacén Central"
                                />
                            </div>

                            {/* Code */}
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Código *
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                    disabled={!!warehouse}
                                    className="input-field"
                                    placeholder="ALM-01"
                                />
                                {warehouse && (
                                    <p className="text-xs text-secondary-500 mt-1">El código no se puede modificar</p>
                                )}
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Tipo de Almacén *
                                </label>
                                <select
                                    name="warehouse_type"
                                    value={formData.warehouse_type}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="CENTRAL">Central</option>
                                    <option value="DAÑADOS">Dañados</option>
                                    <option value="TRANSITO">Tránsito</option>
                                    <option value="VIRTUAL">Virtual</option>
                                </select>
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Dirección
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Calle, número, colonia"
                                />
                            </div>

                            {/* City */}
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Ciudad
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Ciudad"
                                />
                            </div>

                            {/* State */}
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Estado
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Estado"
                                />
                            </div>

                            {/* Postal Code */}
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Código Postal
                                </label>
                                <input
                                    type="text"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="12345"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="5551234567"
                                />
                            </div>

                            {/* Email */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="almacen@empresa.com"
                                />
                            </div>

                            {/* Active Status */}
                            {warehouse && (
                                <div className="md:col-span-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            name="active"
                                            checked={formData.active}
                                            onChange={handleChange}
                                            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-sm font-medium text-secondary-700">Almacén activo</span>
                                    </label>
                                </div>
                            )}
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
                                {loading ? 'Guardando...' : warehouse ? 'Actualizar' : 'Crear Almacén'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WarehouseForm;
