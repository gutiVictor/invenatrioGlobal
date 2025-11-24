import React from 'react';
import { useNavigate } from 'react-router-dom';
import AssetForm from '../../components/Assets/AssetForm';
import assetService from '../../services/assetService';

const AssetCreate = () => {
    const navigate = useNavigate();

    const handleSubmit = async (data) => {
        try {
            await assetService.createAsset(data);
            alert('Activo creado exitosamente');
            navigate('/assets');
        } catch (error) {
            console.error('Error creating asset:', error);
            alert('Error al crear el activo. Verifica los datos.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">Registrar Nuevo Activo</h1>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                    <AssetForm onSubmit={handleSubmit} />
                </div>
            </div>
        </div>
    );
};

export default AssetCreate;
