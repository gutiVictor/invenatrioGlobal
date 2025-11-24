import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import ProductTable from '../../components/Products/ProductTable';
import api from '../../services/api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <button className="btn-secondary">
                        <Filter className="h-5 w-5" />
                        Filtros
                    </button>
                </div>

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
                        <p className="text-secondary-500">No se encontraron productos</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
