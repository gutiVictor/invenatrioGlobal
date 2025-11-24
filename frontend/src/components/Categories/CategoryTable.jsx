import { Edit, Trash2 } from 'lucide-react';

const CategoryTable = ({ categories, onEdit, onDelete }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Código
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Nombre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Slug
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                            Descripción
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
                    {categories.map((category) => (
                        <tr key={category.id} className="hover:bg-secondary-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-secondary-900">{category.code || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-secondary-900">{category.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-secondary-500">{category.slug || '-'}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-secondary-500 truncate max-w-xs">{category.description || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {category.active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(category)}
                                        className="text-primary-600 hover:text-primary-900 p-1 rounded-md hover:bg-primary-50"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(category)}
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

export default CategoryTable;
