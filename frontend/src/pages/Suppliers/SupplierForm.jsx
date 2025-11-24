import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import api from '../../services/api';

const SupplierForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        tax_id: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        city: '',
        country: 'México',
        payment_terms_days: 30,
        contact_person: '',
        notes: '',
        active: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchSupplier();
        }
    }, [id]);

    const fetchSupplier = async () => {
        try {
            const response = await api.get(`/suppliers/${id}`);
            if (response.data.success) {
                setFormData(response.data.data);
            }
        } catch (err) {
            setError('Error al cargar el proveedor');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditMode) {
                await api.put(`/suppliers/${id}`, formData);
            } else {
                await api.post('/suppliers', formData);
            }
            navigate('/suppliers');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar el proveedor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-secondary-900">
                    {isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </h2>
                <p className="text-secondary-500">
                    {isEditMode ? 'Actualiza la información del proveedor' : 'Ingresa los datos del nuevo proveedor'}
                </p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Información Básica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Código *
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className="input-field"
                                required
                                disabled={isEditMode}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                RFC / Tax ID
                            </label>
                            <input
                                type="text"
                                name="tax_id"
                                value={formData.tax_id}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Persona de Contacto
                            </label>
                            <input
                                type="text"
                                name="contact_person"
                                value={formData.contact_person}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Información de Contacto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

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
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Móvil
                            </label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Dirección</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            />
                        </div>

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
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                País
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">Condiciones Comerciales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Días de Crédito
                            </label>
                            <input
                                type="number"
                                name="payment_terms_days"
                                value={formData.payment_terms_days}
                                onChange={handleChange}
                                className="input-field"
                                min="0"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Notas
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                className="input-field"
                                rows="3"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="active"
                                checked={formData.active}
                                onChange={handleChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-secondary-900">
                                Proveedor Activo
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/suppliers')}
                        className="btn-secondary"
                    >
                        <X className="h-5 w-5" />
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        <Save className="h-5 w-5" />
                        {loading ? 'Guardando...' : 'Guardar Proveedor'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SupplierForm;
