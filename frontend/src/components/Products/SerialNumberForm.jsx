import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import api from '../../services/api';

const SerialNumberForm = ({ productId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        serial: '',
        warehouse_id: '',
        notes: '',
        status: 'available'
    });
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            console.log('Fetching warehouses...');
            const response = await api.get('/warehouses');
            console.log('Warehouses response:', response.data);
            if (response.data.success) {
                setWarehouses(response.data.data);
                // Pre-seleccionar el primer almacén si existe
                if (response.data.data.length > 0) {
                    setFormData(prev => ({ ...prev, warehouse_id: response.data.data[0].id }));
                }
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            setError('Error al cargar almacenes');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/serial-numbers', {
                ...formData,
                product_id: productId
            });
            onSuccess();
        } catch (error) {
            console.error('Error creating serial:', error);
            setError(error.response?.data?.message || 'Error al registrar el serial');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-secondary-900">Registrar Nuevo Serial</h3>
                <button onClick={onCancel} className="text-secondary-400 hover:text-secondary-600">
                    <X className="h-6 w-6" />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Número de Serie *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.serial}
                        onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                        className="input-field"
                        placeholder="Ej: SN-123456789"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Almacén de Ubicación *
                    </label>
                    <select
                        required
                        value={formData.warehouse_id}
                        onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                        className="input-field"
                        disabled={loading || warehouses.length === 0}
                    >
                        <option value="">Seleccione un almacén</option>
                        {warehouses.length === 0 && !error ? (
                            <option value="" disabled>Cargando almacenes...</option>
                        ) : null}
                        {warehouses.map(warehouse => (
                            <option key={warehouse.id} value={warehouse.id}>
                                {warehouse.name} ({warehouse.code})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Notas Adicionales
                    </label>
                    <textarea
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="input-field resize-none"
                        placeholder="Observaciones sobre el estado inicial..."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
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
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Guardar Serial
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SerialNumberForm;
