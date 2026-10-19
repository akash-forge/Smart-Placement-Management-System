import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import AddStudentModal from '../Forms/AddStudentModal';
import EditStudentModal from '../Forms/EditStudentModal';
import Button from '../../components/ui/button/Button';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  registerNumber: string;
  department: string;
  batch: string;
  year: number;
  resumeUrl?: string;
  Cgpa?: Float32Array;
  skills?: string; 
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

const statusBadge = (status: Student['verificationStatus']) => {
  const styles =
    status === 'VERIFIED'
      ? 'bg-lime-100 text-lime-700'
      : status === 'REJECTED'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700';
  const label = status === 'VERIFIED' ? 'Verified' : status === 'REJECTED' ? 'Rejected' : 'Pending';
  return <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${styles}`}>{label}</span>;
};

const StudentListPage: React.FC = () => { 
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchStudents = async () => {
    try {
      const res = await apiClient.get('/student');
      setStudents(res.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await apiClient.delete(`/student/${id}`);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  // Admin or Staff on the backend (enforced server-side) — matches the plan
  // that Staff verifies Students, with Admin able to as well.
  const handleSetStatus = async (student: Student, verificationStatus: Student['verificationStatus']) => {
    setUpdatingId(student.id);
    try {
      await apiClient.patch(`/student/${student.id}/verify`, { verificationStatus });
      fetchStudents();
    } catch (err: any) {
      console.error('Error updating verification status', err);
      alert(err?.response?.data?.message || 'Failed to update verification status.');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Student List</h2>
        <Button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowAddModal(true)}
        >
          Add Student
        </Button>
      </div>

      {showAddModal && (
        <AddStudentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchStudents();
            setShowAddModal(false);
          }}
        />
      )}

      {editStudent && (
        <EditStudentModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSuccess={() => {
            fetchStudents();
            setEditStudent(null);
          }}
        />
      )}

      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Register Number</th>
            <th className="p-2 border">Department</th>
            <th className="p-2 border">Batch</th>
            <th className="p-2 border">Year</th>
            <th className="p-2 border">Resume Url</th>
            <th className="p-2 border">CGPA</th>
            <th className="p-2 border">Skills</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-t">
              <td className="p-2 border">{student.name}</td>
              <td className="p-2 border">{student.email}</td>
              <td className="p-2 border">{student.phone}</td>
              <td className="p-2 border">{student.registerNumber}</td>
              <td className="p-2 border">{student.department}</td>
              <td className="p-2 border">{student.batch}</td>
              <td className="p-2 border">{student.year}</td>
              <td className="p-2 border">{student.resumeUrl}</td>
              <td className="p-2 border">{student.Cgpa}</td>
              <td className="p-2 border">{student.skills}</td>
              <td className="p-2 border">{statusBadge(student.verificationStatus)}</td>
              <td className="p-2 border space-x-2 flex">
                {student.verificationStatus !== 'VERIFIED' && (
                  <Button
                    onClick={() => handleSetStatus(student, 'VERIFIED')}
                    disabled={updatingId === student.id}
                    className="bg-lime-600 text-white px-2 py-4 rounded disabled:opacity-50"
                    title="Approve"
                  >
                    <FaCheck style={{ cursor: 'pointer' }} />
                  </Button>
                )}
                {student.verificationStatus !== 'REJECTED' && (
                  <Button
                    onClick={() => handleSetStatus(student, 'REJECTED')}
                    disabled={updatingId === student.id}
                    className="bg-gray-500 text-white px-2 py-4 rounded disabled:opacity-50"
                    title="Reject"
                  >
                    <FaTimes style={{ cursor: 'pointer' }} />
                  </Button>
                )}
               <Button
                  onClick={() => setEditStudent(student)}
                  className="bg-green-500 text-white px-2 py-4 rounded"
                >
                  <FaEdit style={{ cursor: 'pointer' }} />
                </Button>
                <Button
                  onClick={() => handleDelete(student.id)}
                  className="bg-red-500 text-white px-2 py-4 rounded"
                >
                  <FaTrash style={{ cursor: 'pointer' }} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentListPage;
