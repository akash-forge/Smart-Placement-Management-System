import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import apiClient from '../../api/client';
import Button from '../../components/ui/button/Button';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';

interface EditStudentModalProps {
  student: {
    id: number;
    name: string;
    email: string;
    phone: string;
    department: string;
    batch: string;
    registerNumber: string;
    year: number;
    resumeUrl?: string;
    cgpa?: Float32Array;
    skills?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

type StudentFormInputs = {
  name: string;
  email: string;
  phone: string;
  department: string;
  batch: string;
  registerNumber: string;
  year: number;
  resumeUrl?: string;
  cgpa?: Float32Array;
  skills?: string;
};

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  onClose,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormInputs>({
    defaultValues: {
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      batch: student.batch,
      registerNumber: student.registerNumber,
      year: student.year,
      resumeUrl: student.resumeUrl,
      cgpa: student.cgpa,
      skills: student.skills,
    },
  });

  useEffect(() => {
    reset({
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      batch: student.batch,
      registerNumber: student.registerNumber,
      year: student.year,
      resumeUrl: student.resumeUrl,
      cgpa: student.cgpa,
      skills: student.skills,
    });
  }, [student, reset]);

  const onSubmit: SubmitHandler<StudentFormInputs> = async (data) => {
    try {
      await apiClient.patch(`/student/${student.id}`, data);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  return (
    <div className="inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Edit Student</h2>

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
            {errors.year && (
              <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
            )}
          </div>

            <div>
            <Label className="block font-medium mb-1">Resume URL</Label>
            <Input
              {...register('resumeUrl', { required: 'resume url is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.resumeUrl && (
              <p className="text-red-500 text-sm mt-1">{errors.resumeUrl.message}</p>
            )}
          </div>

            <div>
            <Label className="block font-medium mb-1">CGPA</Label>
            <Input
              {...register('cgpa', { required: 'CGPA is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.cgpa && (
              <p className="text-red-500 text-sm mt-1">{errors.cgpa.message}</p>
            )}
          </div>

            <div>
            <Label className="block font-medium mb-1">Skills</Label>
            <Input
              {...register('skills', { required: 'Skills is required' })}
              className="w-full border px-3 py-2 rounded"
            />
            {errors.skills && (
              <p className="text-red-500 text-sm mt-1">{errors.skills.message}</p>
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
              {isSubmitting ? 'Saving...' : 'Update Student'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
