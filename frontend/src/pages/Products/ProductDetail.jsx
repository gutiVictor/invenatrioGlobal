import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Box, Shield, Wrench, QrCode } from 'lucide-react';
import api from '../../services/api';
import SerialNumberList from '../../components/Products/SerialNumberList';
import MaintenanceHistory from '../../components/Products/MaintenanceHistory';
import MaintenanceForm from '../../components/Products/MaintenanceForm';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            if (response.data.success) {
                setProduct(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await api.delete(`/products/${id}`);
                navigate('/products');
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <p className="text-secondary-500">Producto no encontrado</p>
                <Link to="/products" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
                    Volver a la lista
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/products" className="p-2 hover:bg-secondary-100 rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6 text-secondary-600" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-secondary-900">{product.name}</h2>
                        <div className="flex items-center gap-2 text-secondary-500">
                            <span>{product.brand} {product.model}</span>
                            <span>•</span>
                            <span>SKU: {product.sku}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/products/edit/${id}`} className="btn-secondary">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Link>
                    <button onClick={handleDelete} className="btn-danger">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                    </button>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Box className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-secondary-500">Stock Total</p>
                        <p className="text-xl font-bold text-secondary-900">{product.stock} {product.unit}</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                        <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-secondary-500">Garantía</p>
                        <p className="text-xl font-bold text-secondary-900">{product.warranty_months} Meses</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                        <Wrench className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm text-secondary-500">Mantenimiento</p>
                        <p className="text-xl font-bold text-secondary-900">Cada {product.maintenance_cycle_days} días</p>
                    </div>
                </div>
                <div className="card p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <QrCode className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-secondary-500">Tipo</p>
                        <div className="flex gap-1 mt-1">
                            {product.is_serializable && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Serial</span>}
                            {product.is_batchable && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Lote</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-secondary-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'info'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                            }`}
                    >
                        Información General
                    </button>
                    <button
                        onClick={() => setActiveTab('serials')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'serials'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                            }`}
                    >
                        Números de Serie
                    </button>
                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'maintenance'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                            }`}
                    >
                        Historial de Mantenimiento
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="card p-6">
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-medium text-secondary-900 mb-4">Detalles del Producto</h3>
                            <dl className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-secondary-500">Descripción</dt>
                                    <dd className="text-sm text-secondary-900 col-span-2">{product.description || 'Sin descripción'}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-secondary-500">Categoría</dt>
                                    <dd className="text-sm text-secondary-900 col-span-2">{product.category?.name || 'N/A'}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-secondary-500">Proveedor</dt>
                                    <dd className="text-sm text-secondary-900 col-span-2">{product.supplier?.name || 'N/A'}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-secondary-500">Código de Barras</dt>
                                    <dd className="text-sm text-secondary-900 col-span-2">{product.barcode || 'N/A'}</dd>
                                </div>
                            </dl>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-secondary-900 mb-4">Precios e Inventario</h3>
                            <dl className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-secondary-500">Precio de Venta</dt>
                                    <dd className="text-sm font-medium text-secondary-900 col-span-2">${product.price}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-secondary-500">Costo Unitario</dt>
                                    <dd className="text-sm text-secondary-900 col-span-2">${product.cost}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-secondary-500">Stock Mínimo</dt>
                                    <dd className="text-sm text-secondary-900 col-span-2">{product.stock_min}</dd>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <dt className="text-sm font-medium text-secondary-500">Stock Máximo</dt>
                                    <dd className="text-sm text-secondary-900 col-span-2">{product.stock_max}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}

                {activeTab === 'serials' && (
                    <SerialNumberList productId={id} />
                )}

                {activeTab === 'maintenance' && (
                    <>
                        <MaintenanceHistory
                            productId={id}
                            onScheduleClick={() => setShowMaintenanceForm(true)}
                        />
                        <MaintenanceForm
                            isOpen={showMaintenanceForm}
                            onClose={() => setShowMaintenanceForm(false)}
                            productId={id}
                            onSuccess={fetchProduct}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
