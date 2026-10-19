import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import apiClient from '../../api/client';
import { DEFAULT_AVATAR_URL } from '../../config/constants';
import Button from '../../components/ui/button/Button';
import Input from '../../components/form/input/InputField';
import Label from '../../components/form/Label';

interface AddStudentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type StudentFormInputs = {
  name: string;
  email: string;
  phone: string;
  registerNumber: string;
  department: string;
  batch: string;
  year: number;
  resumeUrl?: string;
  cgpa?: Float32Array;
  skills?: string;
  password: string; // added
};

const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormInputs>();

  const onSubmit: SubmitHandler<StudentFormInputs> = async (data) => {
    try {
      await apiClient.post('/student', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        registerNumber: data.registerNumber,
        department: data.department,
        batch: data.batch,
        year: data.year,
        resumeUrl: data.resumeUrl,
        cgpa: data.cgpa,
        skills: data.skills,

        userData: {
          name: data.name,
          email: data.email,
          password: data.password,
          phoneno: data.phone,
          role: 'STUDENT',
          avatarUrl: DEFAULT_AVATAR_URL,
        },
      });

      reset();
      onSuccess();
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error adding student:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Failed to add student');
    }
  };

  return (
    <div className="inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Add Student</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="block font-medium mb-1">Name</Label>
            <Input
              {...register('name', { required: 'Name is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
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
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label className="block font-medium mb-1">Phone</Label>
            <Input
              {...register('phone', { required: 'Phone number is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

             <div>
            <Label className="block font-medium mb-1">Register Number</Label>
            <Input
              {...register('registerNumber', { required: 'Enrollment number is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.registerNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.registerNumber.message}</p>
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
            <Label className="block font-medium mb-1">Batch</Label>
            <Input
              {...register('batch', { required: 'batch is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.batch && (
              <p className="text-red-500 text-sm mt-1">{errors.batch.message}</p>
            )}
          </div>

          <div>
            <Label className="block font-medium mb-1">Year</Label>
            <Input
              type="number"
              {...register('year', {
                required: 'Year is required',
                min: { value: 1, message: 'Minimum year is 1' },
                max: { value: 5, message: 'Maximum year is 5' },
              })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
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
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {isSubmitting ? 'Saving...' : 'Add Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
