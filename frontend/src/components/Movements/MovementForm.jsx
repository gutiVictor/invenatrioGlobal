import { useState, useEffect } from 'react';
import { X, Package, Warehouse, AlertCircle, TruckIcon } from 'lucide-react';
import api from '../../services/api';

const MovementForm = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        type: 'entrada',
        product_id: '',
        warehouse_id: '',
        warehouse_dest_id: '',
        quantity: '',
        unit_cost: '',
        unit_price: '',
        reference: '',
        notes: '',
        customer_id: '',
        supplier_id: ''
    });
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [availableStock, setAvailableStock] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchProducts();
            fetchWarehouses();
            fetchSuppliers();
        }
    }, [isOpen]);

    useEffect(() => {
        // Fetch stock when product and warehouse are selected for salida/transferencia
        if (formData.product_id && formData.warehouse_id && (formData.type === 'salida' || formData.type === 'transferencia')) {
            fetchAvailableStock();
        } else {
            setAvailableStock(0);
        }
    }, [formData.product_id, formData.warehouse_id, formData.type]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products?limit=1000&active=true');
            if (response.data.success) {
                setProducts(response.data.data.products || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const response = await api.get('/warehouses?active=true');
            if (response.data.success) {
                setWarehouses(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            setWarehouses([]);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/suppliers?active=true');
            if (response.data.success) {
                setSuppliers(response.data.data.suppliers || []);
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            setSuppliers([]);
        }
    };

    const fetchAvailableStock = async () => {
        try {
            const response = await api.get(`/products/${formData.product_id}`);
            if (response.data.success) {
                const productWarehouses = response.data.data.warehouses || [];
                const warehouseStock = productWarehouses.find(
                    pw => pw.warehouse_id === parseInt(formData.warehouse_id)
                );
                setAvailableStock(warehouseStock?.stock || 0);
            }
        } catch (error) {
            console.error('Error fetching stock:', error);
            setAvailableStock(0);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validations
        if (!formData.product_id) {
            setError('Debe seleccionar un producto');
            return;
        }
        if (!formData.warehouse_id) {
            setError('Debe seleccionar un almacén');
            return;
        }
        if (!formData.quantity || parseFloat(formData.quantity) === 0) {
            setError('La cantidad debe ser mayor a cero');
            return;
        }

        if (formData.type === 'transferencia' && !formData.warehouse_dest_id) {
            setError('Debe seleccionar un almacén de destino para transferencias');
            return;
        }

        if (formData.type === 'transferencia' && formData.warehouse_id === formData.warehouse_dest_id) {
            setError('El almacén de destino debe ser diferente al de origen');
            return;
        }

        // Check stock for salida and transferencia
        if ((formData.type === 'salida' || formData.type === 'transferencia')) {
            const qty = Math.abs(parseFloat(formData.quantity));
            if (qty > availableStock) {
                setError(`Stock insuficiente. Disponible: ${availableStock}`);
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            // Prepare data
            const movementData = {
                type: formData.type,
                product_id: parseInt(formData.product_id),
                warehouse_id: parseInt(formData.warehouse_id),
                quantity: formData.type === 'salida' ? -Math.abs(parseFloat(formData.quantity)) : Math.abs(parseFloat(formData.quantity)),
                reference: formData.reference || null,
                notes: formData.notes || null
            };

            // Add type-specific fields
            if (formData.type === 'transferencia') {
                movementData.warehouse_dest_id = parseInt(formData.warehouse_dest_id);
            }

            if (formData.unit_cost) {
                movementData.unit_cost = parseFloat(formData.unit_cost);
            }

            if (formData.unit_price) {
                movementData.unit_price = parseFloat(formData.unit_price);
            }

            if (formData.supplier_id) {
                movementData.supplier_id = parseInt(formData.supplier_id);
            }

            if (formData.customer_id) {
                movementData.customer_id = parseInt(formData.customer_id);
            }

            const response = await api.post('/movements', movementData);

            if (response.data.success) {
                onSuccess();
                handleClose();
            }
        } catch (error) {
            console.error('Error creating movement:', error);
            setError(error.response?.data?.message || 'Error al crear el movimiento');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            type: 'entrada',
            product_id: '',
            warehouse_id: '',
            warehouse_dest_id: '',
            quantity: '',
            unit_cost: '',
            unit_price: '',
            reference: '',
            notes: '',
            customer_id: '',
            supplier_id: ''
        });
        setError('');
        setAvailableStock(0);
        onClose();
    };

    if (!isOpen) return null;

    const selectedProduct = products.find(p => p.id === parseInt(formData.product_id));

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-secondary-500 bg-opacity-75" onClick={handleClose}></div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-secondary-200">
                        <h3 className="text-lg font-medium text-secondary-900">Nuevo Movimiento de Inventario</h3>
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
                            {/* Movement Type */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Tipo de Movimiento *
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="entrada">Entrada (Compra/Recepción)</option>
                                    <option value="salida">Salida (Venta/Consumo)</option>
                                    <option value="transferencia">Transferencia entre Almacenes</option>
                                    <option value="ajuste">Ajuste de Inventario</option>
                                </select>
                            </div>

                            {/* Product */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Producto *
                                </label>
                                <select
                                    name="product_id"
                                    value={formData.product_id}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="">Seleccionar producto...</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} ({product.sku})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Warehouse (Origin) */}
                            <div className={formData.type === 'transferencia' ? '' : 'md:col-span-2'}>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Almacén {formData.type === 'transferencia' ? 'Origen' : ''} *
                                </label>
                                <select
                                    name="warehouse_id"
                                    value={formData.warehouse_id}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="">Seleccionar almacén...</option>
                                    {warehouses.map(warehouse => (
                                        <option key={warehouse.id} value={warehouse.id}>
                                            {warehouse.name} ({warehouse.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Warehouse Destination (only for transferencia) */}
                            {formData.type === 'transferencia' && (
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Almacén Destino *
                                    </label>
                                    <select
                                        name="warehouse_dest_id"
                                        value={formData.warehouse_dest_id}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                    >
                                        <option value="">Seleccionar destino...</option>
                                        {warehouses.filter(w => w.id !== parseInt(formData.warehouse_id)).map(warehouse => (
                                            <option key={warehouse.id} value={warehouse.id}>
                                                {warehouse.name} ({warehouse.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Cantidad *
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                    min="0.01"
                                    step="0.01"
                                    className="input-field"
                                    placeholder="0"
                                />
                                {selectedProduct && (
                                    <p className="text-xs text-secondary-500 mt-1">Unidad: {selectedProduct.unit}</p>
                                )}
                                {(formData.type === 'salida' || formData.type === 'transferencia') && formData.product_id && formData.warehouse_id && (
                                    <p className={`text-xs mt-1 ${availableStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Stock disponible: {availableStock}
                                    </p>
                                )}
                            </div>

                            {/* Unit Cost (mainly for entrada) */}
                            {(formData.type === 'entrada' || formData.type === 'ajuste') && (
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Costo Unitario
                                    </label>
                                    <input
                                        type="number"
                                        name="unit_cost"
                                        value={formData.unit_cost}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="input-field"
                                        placeholder="0.00"
                                    />
                                </div>
                            )}

                            {/* Unit Price (mainly for salida) */}
                            {formData.type === 'salida' && (
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Precio Unitario
                                    </label>
                                    <input
                                        type="number"
                                        name="unit_price"
                                        value={formData.unit_price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="input-field"
                                        placeholder="0.00"
                                    />
                                </div>
                            )}

                            {/* Reference */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Referencia {formData.type === 'entrada' ? '(Factura/OC)' : formData.type === 'salida' ? '(Orden/Ticket)' : ''}
                                </label>
                                <input
                                    type="text"
                                    name="reference"
                                    value={formData.reference}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Número de documento"
                                />
                            </div>

                            {/* Supplier (for entrada) */}
                            {formData.type === 'entrada' && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                                        Proveedor
                                    </label>
                                    <select
                                        name="supplier_id"
                                        value={formData.supplier_id}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        <option value="">Seleccionar proveedor...</option>
                                        {suppliers.map(supplier => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name} ({supplier.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Notes */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Notas
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="input-field"
                                    placeholder="Observaciones adicionales"
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
                                {loading ? 'Guardando...' : 'Registrar Movimiento'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MovementForm;
