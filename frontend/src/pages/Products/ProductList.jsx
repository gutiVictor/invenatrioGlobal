import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import ProductTable from '../../components/Products/ProductTable';
import api from '../../services/api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        is_serializable: false,
        is_batchable: false,
        has_warranty: false
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            if (response.data.success) {
                setProducts(response.data.data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        navigate(`/products/edit/${product.id}`);
    };

    const handleDelete = async (product) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await api.delete(`/products/${product.id}`);
                fetchProducts(); // Recargar lista
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const toggleFilter = (key) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSerializable = !filters.is_serializable || product.is_serializable;
        const matchesBatchable = !filters.is_batchable || product.is_batchable;
        const matchesWarranty = !filters.has_warranty || (product.warranty_months > 0);

        return matchesSearch && matchesSerializable && matchesBatchable && matchesWarranty;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Productos</h2>
                    <p className="text-secondary-500">Gestiona el catálogo de productos</p>
                </div>
                <Link to="/products/new" className="btn-primary">
                    <Plus className="h-5 w-5" />
                    Nuevo Producto
                </Link>
            </div>

            <div className="card p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-secondary-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, SKU o código de barras..."
                            className="input-field pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className={`btn-secondary ${showFilters ? 'bg-secondary-200 text-secondary-900' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="h-5 w-5" />
                        Filtros
                    </button>
                </div>

                {showFilters && (
                    <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-200 animate-fade-in">
                        <h3 className="text-sm font-medium text-secondary-700 mb-3">Filtrar por características:</h3>
                        <div className="flex flex-wrap gap-4">
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                    checked={filters.is_serializable}
                                    onChange={() => toggleFilter('is_serializable')}
                                />
                                <span className="ml-2 text-sm text-secondary-700">Requiere Serial</span>
                            </label>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                    checked={filters.is_batchable}
                                    onChange={() => toggleFilter('is_batchable')}
                                />
                                <span className="ml-2 text-sm text-secondary-700">Maneja Lotes</span>
                            </label>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                    checked={filters.has_warranty}
                                    onChange={() => toggleFilter('has_warranty')}
                                />
                                <span className="ml-2 text-sm text-secondary-700">Con Garantía</span>
                            </label>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <ProductTable
                        products={filteredProducts}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                ) : (
                    <div className="text-center py-12">
                        <p className="text-secondary-500">No se encontraron productos que coincidan con los filtros</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
