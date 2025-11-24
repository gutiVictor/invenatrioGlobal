import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Loader2 } from 'lucide-react';
import api from '../../services/api';

const CategoryForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        active: true
    });

    useEffect(() => {
        if (isEditMode) {
            fetchCategory(id);
        }
    }, [id]);

    const fetchCategory = async (categoryId) => {
        try {
            setLoading(true);
            const response = await api.get(`/categories/${categoryId}`);
            if (response.data.success) {
                setFormData(response.data.data);
            }
        } catch (err) {
            setError('Error al cargar la categoría');
        } finally {
            setLoading(false);
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
                await api.put(`/categories/${id}`, formData);
            } else {
                await api.post('/categories', formData);
            }
            navigate('/categories');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar la categoría');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">
                        {isEditMode ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h2>
                    <p className="text-secondary-500">
                        {isEditMode ? 'Actualiza la información de la categoría' : 'Ingresa los datos de la nueva categoría'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/categories')}
                    className="p-2 hover:bg-secondary-100 rounded-lg text-secondary-500 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-6 p-6">
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Nombre de la Categoría *
                    </label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Ej: Laptops, Monitores..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Descripción
                    </label>
                    <textarea
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                        className="input-field resize-none"
                        placeholder="Descripción opcional..."
                    />
                </div>

                {isEditMode && (
                    <div className="flex items-center">
                        <input
                            id="active"
                            name="active"
                            type="checkbox"
                            checked={formData.active}
                            onChange={handleChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="active" className="ml-2 block text-sm text-secondary-900">
                            Categoría Activa
                        </label>
                    </div>
                )}

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-secondary-100">
                    <button
                        type="button"
                        onClick={() => navigate('/categories')}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Guardar Categoría
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;
