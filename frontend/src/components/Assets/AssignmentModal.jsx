import React, { useState, useEffect } from 'react';

const AssignmentModal = ({ isOpen, onClose, onAssign, onUpdate, asset, assignment, isEditMode = false }) => {
    const [formData, setFormData] = useState({
        assigned_to: '',
        employee_id: '',
        employee_email: '',
        employee_phone: '',
        job_title: '',
        department: '',
        physical_location: '',
        expected_return_date: '',
        condition_on_assign: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    // Load existing assignment data when in edit mode
    useEffect(() => {
        if (isEditMode && assignment) {
            setFormData({
                assigned_to: assignment.assigned_to || '',
                employee_id: assignment.employee_id || '',
                employee_email: assignment.employee_email || '',
                employee_phone: assignment.employee_phone || '',
                job_title: assignment.job_title || '',
                department: assignment.department || '',
                physical_location: assignment.physical_location || '',
                expected_return_date: assignment.expected_return_date || '',
                condition_on_assign: assignment.condition_on_assign || '',
                notes: assignment.notes || ''
            });
        } else {
            // Reset form when creating new assignment
            setFormData({
                assigned_to: '',
                employee_id: '',
                employee_email: '',
                employee_phone: '',
                job_title: '',
                department: '',
                physical_location: '',
                expected_return_date: '',
                condition_on_assign: '',
                notes: ''
            });
        }
        setErrors({});
    }, [isEditMode, assignment, isOpen]);

    if (!isOpen) return null;

    const validateForm = () => {
        const newErrors = {};

        if (!formData.assigned_to.trim()) {
            newErrors.assigned_to = 'El nombre del empleado es requerido';
        }

        if (formData.employee_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.employee_email)) {
            newErrors.employee_email = 'Email inválido';
        }

        if (formData.employee_phone && !/^[\d\s\-\+\(\)]+$/.test(formData.employee_phone)) {
            newErrors.employee_phone = 'Teléfono inválido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (isEditMode && assignment) {
            onUpdate(assignment.id, formData);
        } else {
            onAssign(asset.id, formData);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {isEditMode ? 'Editar Asignación' : `Asignar Activo: ${asset?.product?.name}`}
                                    </h3>
                                    {!isEditMode && (
                                        <div className="mt-2 text-sm text-gray-500 mb-4">
                                            Serial: {asset?.serial_number}
                                        </div>
                                    )}

                                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {/* Assigned To */}
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Asignar a (Empleado) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="assigned_to"
                                                required
                                                className={`mt-1 block w-full border ${errors.assigned_to ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                                value={formData.assigned_to}
                                                onChange={handleChange}
                                                placeholder="Nombre completo"
                                            />
                                            {errors.assigned_to && <p className="mt-1 text-sm text-red-600">{errors.assigned_to}</p>}
                                        </div>

                                        {/* Employee ID */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">ID de Empleado</label>
                                            <input
                                                type="text"
                                                name="employee_id"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.employee_id}
                                                onChange={handleChange}
                                                placeholder="EMP-12345"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Email</label>
                                            <input
                                                type="email"
                                                name="employee_email"
                                                className={`mt-1 block w-full border ${errors.employee_email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                                value={formData.employee_email}
                                                onChange={handleChange}
                                                placeholder="empleado@empresa.com"
                                            />
                                            {errors.employee_email && <p className="mt-1 text-sm text-red-600">{errors.employee_email}</p>}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                                            <input
                                                type="tel"
                                                name="employee_phone"
                                                className={`mt-1 block w-full border ${errors.employee_phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                                value={formData.employee_phone}
                                                onChange={handleChange}
                                                placeholder="+1 234-567-8900"
                                            />
                                            {errors.employee_phone && <p className="mt-1 text-sm text-red-600">{errors.employee_phone}</p>}
                                        </div>

                                        {/* Job Title */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Cargo / Puesto</label>
                                            <input
                                                type="text"
                                                name="job_title"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.job_title}
                                                onChange={handleChange}
                                                placeholder="Ej. Desarrollador Senior"
                                            />
                                        </div>

                                        {/* Department */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Departamento / Área</label>
                                            <input
                                                type="text"
                                                name="department"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.department}
                                                onChange={handleChange}
                                                placeholder="Ej. Sistemas, RRHH"
                                            />
                                        </div>

                                        {/* Physical Location */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Ubicación Física</label>
                                            <input
                                                type="text"
                                                name="physical_location"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.physical_location}
                                                onChange={handleChange}
                                                placeholder="Oficina, Piso, Cubículo"
                                            />
                                        </div>

                                        {/* Expected Return Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Fecha Estimada de Devolución</label>
                                            <input
                                                type="date"
                                                name="expected_return_date"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.expected_return_date}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        {/* Condition on Assign */}
                                        {!isEditMode && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Condición de Entrega</label>
                                                <select
                                                    name="condition_on_assign"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    value={formData.condition_on_assign}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="new">Nuevo</option>
                                                    <option value="good">Bueno</option>
                                                    <option value="fair">Regular</option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Notes */}
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Notas Adicionales</label>
                                            <textarea
                                                name="notes"
                                                rows="3"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                value={formData.notes}
                                                onChange={handleChange}
                                                placeholder="Cualquier información adicional sobre esta asignación..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                            >
                                {isEditMode ? 'Actualizar' : 'Asignar'}
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignmentModal;
