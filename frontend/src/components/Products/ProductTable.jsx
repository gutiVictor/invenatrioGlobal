import { Edit, Trash2, MoreVertical } from 'lucide-react';

const ProductTable = ({ products, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Producto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Categoría
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Proveedor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Precio
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Stock
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Estado
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Acciones</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-secondary-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0">
                                        {product.image_url ? (
                                            <img className="h-10 w-10 rounded-lg object-cover" src={product.image_url} alt="" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                                {product.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-secondary-900">{product.name}</div>
                                        <div className="text-sm text-secondary-500">{product.sku}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-secondary-900">{product.category?.name || 'Sin categoría'}</div>
                                {product.category?.code && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-800">
                                        {product.category.code}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-secondary-900">{product.supplier?.name || 'Sin proveedor'}</div>
                                {product.supplier?.code && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        {product.supplier.code}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-secondary-900">${product.price}</div>
                                <div className="text-xs text-secondary-500">Costo: ${product.cost}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm font-medium ${product.stock_min > 0 && product.stock <= product.stock_min ? 'text-red-600' : 'text-secondary-900'}`}>
                                    {product.stock || 0} {product.unit}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {product.active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="text-primary-600 hover:text-primary-900 p-1 rounded-md hover:bg-primary-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(product)}
                                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
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

export default ProductTable;
