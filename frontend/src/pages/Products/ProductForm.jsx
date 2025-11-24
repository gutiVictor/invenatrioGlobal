import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        description: '',
        category_id: '',
        supplier_id: '',
        price: '',
        cost: '',
        stock: '',
        stock_min: '',
        stock_max: '',
        unit: 'un',
        image_url: '',
        active: true,
        admission_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchProduct(id);
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            if (response.data.success) {
                setCategories(response.data.data);
            }
        } catch (err) {
            console.error('Error loading categories:', err);
        }
    };

    const fetchProduct = async (productId) => {
        try {
            setLoading(true);
            const response = await api.get(`/products/${productId}`);
            if (response.data.success) {
                setFormData(response.data.data);
            }
        } catch (err) {
            setError('Error al cargar el producto');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditMode) {
                await api.put(`/products/${id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar el producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">
                        {isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <p className="text-secondary-500">
                        {isEditMode ? 'Actualiza la información del producto' : 'Ingresa los datos del nuevo producto'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/products')}
                    className="p-2 hover:bg-secondary-100 rounded-lg text-secondary-500 transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna Izquierda - Información Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card space-y-4">
                            <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-100 pb-2">
                                Información Básica
                            </h3>



                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Fecha de Ingreso *
                                    </label>
                                    <input
                                        type="date"
                                        name="admission_date"
                                        required
                                        value={formData.admission_date}
                                        onChange={handleChange}
                                        className="input-field"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Nombre del Producto *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="Ej: Laptop HP Pavilion"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        SKU *
                                    </label>
                                    <input
                                        type="text"
                                        name="sku"
                                        required
                                        value={formData.sku}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="LAP-HP-001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Código de Barras
                                    </label>
                                    <input
                                        type="text"
                                        name="barcode"
                                        value={formData.barcode}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="750123456789"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        name="description"
                                        rows="3"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="input-field resize-none"
                                        placeholder="Detalles adicionales del producto..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="card space-y-4">
                            <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-100 pb-2">
                                Precios e Inventario
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Precio de Venta *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-secondary-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="input-field pl-7"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Costo
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-secondary-500">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="cost"
                                            min="0"
                                            step="0.01"
                                            value={formData.cost}
                                            onChange={handleChange}
                                            className="input-field pl-7"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Stock Inicial *
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        required
                                        min="0"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Stock Mínimo
                                    </label>
                                    <input
                                        type="number"
                                        name="stock_min"
                                        min="0"
                                        value={formData.stock_min}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="5"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Stock Máximo
                                    </label>
                                    <input
                                        type="number"
                                        name="stock_max"
                                        min="0"
                                        value={formData.stock_max}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha - Clasificación e Imagen */}
                    <div className="space-y-6">
                        <div className="card space-y-4">
                            <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-100 pb-2">
                                Clasificación
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Categoría
                                </label>
                                <select
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name} {cat.code ? `(${cat.code})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Unidad de Medida
                                </label>
                                <select
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="un">Unidad (un)</option>
                                    <option value="kg">Kilogramo (kg)</option>
                                    <option value="lt">Litro (lt)</option>
                                    <option value="m">Metro (m)</option>
                                    <option value="caja">Caja</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    ID Proveedor
                                </label>
                                <input
                                    type="number"
                                    name="supplier_id"
                                    value={formData.supplier_id}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="ID del proveedor"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    name="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="active" className="text-sm font-medium text-secondary-700">
                                    Producto Activo
                                </label>
                            </div>
                        </div>

                        <div className="card space-y-4">
                            <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-100 pb-2">
                                Imagen
                            </h3>

                            <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-primary-500 transition-colors cursor-pointer bg-secondary-50">
                                {formData.image_url ? (
                                    <img src={formData.image_url} alt="Preview" className="max-h-40 rounded-md" />
                                ) : (
                                    <>
                                        <ImageIcon className="h-12 w-12 text-secondary-400 mb-2" />
                                        <p className="text-sm text-secondary-500">
                                            Click para subir imagen o arrastra aquí
                                        </p>
                                        <p className="text-xs text-secondary-400 mt-1">
                                            PNG, JPG hasta 5MB
                                        </p>
                                    </>
                                )}
                            </div>

                            <input
                                type="text"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                className="input-field text-xs"
                                placeholder="O pega una URL de imagen..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-secondary-200">
                    <button
                        type="button"
                        onClick={() => navigate('/products')}
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
                                Guardar Producto
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
