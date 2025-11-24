import { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Calendar, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import SerialNumberForm from './SerialNumberForm';

const SerialNumberList = ({ productId }) => {
    const [serials, setSerials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (productId) {
            fetchSerials();
        }
    }, [productId]);

    const fetchSerials = async () => {
        try {
            setLoading(true);
            const response = await api.get('/serial-numbers', {
                params: { product_id: productId }
            });
            setSerials(response.data);
        } catch (error) {
            console.error('Error fetching serials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSerialCreated = () => {
        setShowForm(false);
        fetchSerials();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'available':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Disponible</span>;
            case 'in_use':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"><FileText className="w-3 h-3 mr-1" /> En Uso</span>;
            case 'maintenance':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3 mr-1" /> Mantenimiento</span>;
            case 'retired':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Retirado</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const filteredSerials = serials.filter(item =>
        item.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouse?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-secondary-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por serial o almacén..."
                        className="input-field pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                >
                    <Plus className="h-5 w-5" />
                    Registrar Serial
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <SerialNumberForm
                            productId={productId}
                            onSuccess={handleSerialCreated}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : filteredSerials.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-secondary-200">
                        <thead className="bg-secondary-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Serial</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Almacén</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Fecha Registro</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">Notas</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-secondary-200">
                            {filteredSerials.map((item) => (
                                <tr key={item.id} className="hover:bg-secondary-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-secondary-900">{item.serial}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {item.warehouse?.name || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(item.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-secondary-500 truncate max-w-xs">
                                        {item.notes || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-secondary-50 rounded-lg border border-dashed border-secondary-300">
                    <p className="text-secondary-500">No hay números de serie registrados para este producto.</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-primary-600 hover:text-primary-700 font-medium mt-2"
                    >
                        Registrar el primero
                    </button>
                </div>
            )}
        </div>
    );
};

export default SerialNumberList;
