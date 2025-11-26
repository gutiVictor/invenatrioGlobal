import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AssetForm = ({ initialData = {}, onSubmit, isEdit = false }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        product_id: '',
        serial_number: '',
        asset_tag: '',
        status: 'in_stock',
        condition: 'new',
        acquisition_date: '',
        purchase_price: '',
        warranty_expiry_date: '',
        location: '',
        notes: '',
        specs: {
            ram: '',
            cpu: '',
            storage: '',
            os: ''
        }
    });

    useEffect(() => {
        // Load products for the dropdown
        const fetchProducts = async () => {
            try {
                // Assuming we have a service or endpoint to get all products
                // For now, I'll assume a simple fetch or mock if service doesn't exist
                // But I should use the api service I saw earlier or just axios
                // Let's use the api instance directly if productService isn't ready
                // Wait, I saw productController in backend, so endpoint exists.
                // I'll import api from services
                const response = await api.get('/products?limit=100');
                if (response.data.success) {
                    setProducts(response.data.data.products);
                }
            } catch (error) {
                console.error('Error loading products', error);
            }
        };

        fetchProducts();

        if (initialData && Object.keys(initialData).length > 0) {
            setFormData({
                ...initialData,
                specs: initialData.specs || { ram: '', cpu: '', storage: '', os: '' }
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('specs.')) {
            const specField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                specs: { ...prev.specs, [specField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
            <div className="space-y-8 divide-y divide-gray-200">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Información del Activo</h3>
                    <p className="mt-1 text-sm text-gray-500">Detalles principales del equipo o activo.</p>

                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Producto (Modelo)</label>
                            <select
                                name="product_id"
                                required
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={formData.product_id}
                                onChange={handleChange}
                                disabled={isEdit}
                            >
                                <option value="">Seleccionar Producto...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Número de Serie</label>
                            <input
                                type="text"
                                name="serial_number"
                                required
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={formData.serial_number}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Etiqueta de Activo (Tag)</label>
                            <input
                                type="text"
                                name="asset_tag"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={formData.asset_tag}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Ubicación Física</label>
                            <input
                                type="text"
                                name="location"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Ej. Almacén Central, Oficina 302"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Estado</label>
                            <select
                                name="status"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="in_stock">En Stock</option>
                                <option value="in_use">En Uso</option>
                                <option value="under_repair">En Reparación</option>
                                <option value="retired">Retirado</option>
                                <option value="stolen">Robado</option>
                                <option value="disposed">Desechado</option>
                            </select>
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Condición</label>
                            <select
                                name="condition"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                value={formData.condition}
                                onChange={handleChange}
                            >
                                <option value="new">Nuevo</option>
                                <option value="good">Bueno</option>
                                <option value="fair">Regular</option>
                                <option value="poor">Malo</option>
                                <option value="broken">Roto</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Detalles Técnicos</h3>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Procesador (CPU)</label>
                            <input
                                type="text"
                                name="specs.cpu"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={formData.specs?.cpu || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Memoria RAM</label>
                            <input
                                type="text"
                                name="specs.ram"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={formData.specs?.ram || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Almacenamiento</label>
                            <input
                                type="text"
                                name="specs.storage"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={formData.specs?.storage || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Sistema Operativo</label>
                            <input
                                type="text"
                                name="specs.os"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={formData.specs?.os || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Información Financiera</h3>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Fecha de Adquisición</label>
                            <input
                                type="date"
                                name="acquisition_date"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={formData.acquisition_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Precio de Compra</label>
                            <input
                                type="number"
                                name="purchase_price"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={formData.purchase_price}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Vencimiento Garantía</label>
                            <input
                                type="date"
                                name="warranty_expiry_date"
                                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                value={formData.warranty_expiry_date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-5">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/assets')}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AssetForm;
