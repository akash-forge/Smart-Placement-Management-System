import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import apiClient from '../../api/client';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';

interface EditCompanyModalProps {
    company: {
        id: number;
        name: string;
        email: string;
        phone: string;
        website?: string;
        address?: string;
        industry?: string;
        description?: string;
    };
    onClose: () => void;
    onSuccess: () => void;
}

type CompanyFormInputs = Omit<EditCompanyModalProps['company'], 'id'>;

const EditCompanyModal: React.FC<EditCompanyModalProps> = ({ company, onClose, onSuccess }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting } } = useForm<CompanyFormInputs>({
            defaultValues: company,
        });

    const onSubmit: SubmitHandler<CompanyFormInputs> = async (data) => {
        try {
            await apiClient.patch(`/company/${company.id}`, data);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating company:', error);
        }
    };

    return (
        <div className="inset-5 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
                <h2 className="text-xl font-semibold mb-4">Edit Company</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label>Name</Label>
                        <Input {...register('name', { required: 'Name is required' })} />
                        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                        <Label>Email</Label>
                        <Input type="email" {...register('email', { required: 'Email is required' })} />
                        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
                    </div>

                    <div>
                        <Label>Phone</Label>
                        <Input {...register('phone', { required: 'Phone number is required' })} />
                        {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
                    </div>

                    <div>
                        <Label>Website</Label>
                        <Input {...register('website')} />
                    </div>

                    <div>
                        <Label>Address</Label>
                        <Input {...register('address')} />
                    </div>

                    <div>
                        <Label>Industry</Label>
                        <Input {...register('industry')} />
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Input {...register('description')} />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded">
                            {isSubmitting ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCompanyModal;
