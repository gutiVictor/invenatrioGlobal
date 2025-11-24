import React from 'react';
import { Link } from 'react-router-dom';

const AssetTable = ({ assets, onDelete, onAssign, onReturn }) => {
    const getStatusBadge = (status) => {
        const styles = {
            in_stock: 'bg-green-100 text-green-800',
            in_use: 'bg-blue-100 text-blue-800',
            under_repair: 'bg-yellow-100 text-yellow-800',
            retired: 'bg-gray-100 text-gray-800',
            stolen: 'bg-red-100 text-red-800',
            disposed: 'bg-red-100 text-red-800'
        };

        const labels = {
            in_stock: 'En Stock',
            in_use: 'En Uso',
            under_repair: 'En Reparación',
            retired: 'Retirado',
            stolen: 'Robado',
            disposed: 'Desechado'
        };

        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial / Tag</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {assets.map((asset) => (
                        <tr key={asset.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        {asset.product?.image_url ? (
                                            <img className="h-10 w-10 rounded-full object-cover" src={asset.product.image_url} alt="" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{asset.product?.name || 'Producto desconocido'}</div>
                                        <div className="text-sm text-gray-500">{asset.product?.sku}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">SN: {asset.serial_number}</div>
                                {asset.asset_tag && <div className="text-sm text-gray-500">Tag: {asset.asset_tag}</div>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(asset.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {asset.assignments && asset.assignments.length > 0 ? (
                                    <div>
                                        <div className="font-medium text-gray-900">{asset.assignments[0].assigned_to}</div>
                                        <div className="text-xs">{asset.assignments[0].department}</div>
                                    </div>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {asset.location || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    {asset.status === 'in_stock' && (
                                        <button
                                            onClick={() => onAssign(asset)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                            title="Asignar"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                        </button>
                                    )}
                                    {asset.status === 'in_use' && (
                                        <button
                                            onClick={() => onReturn(asset)}
                                            className="text-orange-600 hover:text-orange-900"
                                            title="Devolver"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                                            </svg>
                                        </button>
                                    )}
                                    <Link to={`/assets/${asset.id}`} className="text-blue-600 hover:text-blue-900" title="Ver Detalles">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </Link>
                                    <Link to={`/assets/${asset.id}/edit`} className="text-yellow-600 hover:text-yellow-900" title="Editar">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </Link>
                                    <button onClick={() => onDelete(asset.id)} className="text-red-600 hover:text-red-900" title="Eliminar">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssetTable;
