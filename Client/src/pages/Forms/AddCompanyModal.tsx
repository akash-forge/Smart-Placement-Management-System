import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import apiClient from '../../api/client';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';

interface AddCompanyModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type CompanyFormInputs = {
  name: string;
  email: string;
  phone: string;
  website?: string;
  address?: string;
  industry?: string;
  description?: string;
  password: string;
};

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CompanyFormInputs>();

  const onSubmit: SubmitHandler<CompanyFormInputs> = async (data) => {
    try {
      await apiClient.post('/company', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website,
        address: data.address,
        industry: data.industry,
        description: data.description,
        userData: {
          name: data.name,
          email: data.email,
          password: data.password,
          role: 'COMPANY',
          phoneno: data.phone,
        },
      });
      reset();
      onSuccess();  // refresh list
      onClose();    // close modal
    } catch (error) {
      console.error('Error adding company:', error);
    }
  };

  return (
    <div className="inset-0 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Add Company</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="block font-medium">Name</Label>
            <Input
              {...register('name', { required: 'Name is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <Label className="block font-medium">Email</Label>
            <Input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <Label className="block font-medium">Phone</Label>
            <Input
              {...register('phone', { required: 'Phone number is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>
          <div>
            <Label className="block font-medium mb-1">Password</Label>
            <Input
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <Label className="block font-medium">Website</Label>
            <Input
              {...register('website')}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <Label className="block font-medium">Address</Label>
            <Input
              {...register('address')}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <Label className="block font-medium">Industry</Label>
            <Input
              {...register('industry')}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <Label className="block font-medium">Description</Label>
            <Input {...register('description')} className="w-full border px-3 py-2 rounded" />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {isSubmitting ? 'Saving...' : 'Add Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanyModal;



