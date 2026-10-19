import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import apiClient from '../../api/client';
import Button from '../../components/ui/button/Button';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';

interface EditStaffModalProps {
  staff: {
    id: number;
    name: string;
    email: string;
    phone: string;
    department?: string;
    designation?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

type StaffFormInputs = {
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
};

const EditStaffModal: React.FC<EditStaffModalProps> = ({
  staff,
  onClose,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormInputs>({
    defaultValues: {
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      department: staff.department,
      designation: staff.designation,
    },
  });

  useEffect(() => {
    reset({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      department: staff.department,
      designation: staff.designation,
    });
  }, [staff, reset]);

  const onSubmit: SubmitHandler<StaffFormInputs> = async (data) => {
    try {
      await apiClient.patch(`/staff/${staff.id}`, data);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  return (
    <div className="inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Staff</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="block font-medium mb-1">Name</Label>
            <Input
              {...register('name', { required: 'Name is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label className="block font-medium mb-1">Email</Label>
            <Input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address',
                },
              })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label className="block font-medium mb-1">Phone</Label>
            <Input
              {...register('phone', { required: 'Phone number is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label className="block font-medium mb-1">Department</Label>
            <Input
              {...register('department', { required: 'Department is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>
            )}
          </div>

          <div>
            <Label className="block font-medium mb-1">Designation</Label>
            <Input
              {...register('designation', { required: 'Designation is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.designation && (
              <p className="text-red-500 text-sm mt-1">{errors.designation.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-yellow-600 text-white px-4 py-2 rounded"
            >
              {isSubmitting ? 'Saving...' : 'Update Staff'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStaffModal;
