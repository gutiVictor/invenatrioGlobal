import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';

const SupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/suppliers');
            if (response.data.success) {
                setSuppliers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (supplier) => {
        navigate(`/suppliers/edit/${supplier.id}`);
    };

    const handleDelete = async (supplier) => {
        if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
            try {
                await api.delete(`/suppliers/${supplier.id}`);
                fetchSuppliers();
            } catch (error) {
                console.error('Error deleting supplier:', error);
            }
        }
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-secondary-900">Proveedores</h2>
                    <p className="text-secondary-500">Gestiona los proveedores de tu inventario</p>
                </div>
                <Link to="/suppliers/new" className="btn-primary">
                    <Plus className="h-5 w-5" />
                    Nuevo Proveedor
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
                            placeholder="Buscar proveedores..."
                            className="input-field pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredSuppliers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-secondary-200">
                            <thead className="bg-secondary-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Código
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Contacto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Teléfono
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-secondary-200">
                                {filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-secondary-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                                            {supplier.code}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                                            {supplier.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                            {supplier.contact_person || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                            {supplier.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                            {supplier.email || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${supplier.active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {supplier.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(supplier)}
                                                className="text-primary-600 hover:text-primary-900 mr-3"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(supplier)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-secondary-500">No se encontraron proveedores</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupplierList;
