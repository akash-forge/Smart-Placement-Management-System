import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import Button from '../../components/ui/button/Button';
import AddStaffModal from '../Forms/AddStaffModal';
import EditStaffModal from '../Forms/EditStaffModal';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  staffId?: string;
  department?: string;
  designation?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

const statusBadge = (status: Staff['verificationStatus']) => {
  const styles =
    status === 'VERIFIED'
      ? 'bg-lime-100 text-lime-700'
      : status === 'REJECTED'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700';
  const label = status === 'VERIFIED' ? 'Verified' : status === 'REJECTED' ? 'Rejected' : 'Pending';
  return <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${styles}`}>{label}</span>;
};

const StaffListPage: React.FC = () => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchStaffs = async () => {
    try {
      const res = await apiClient.get('/staff');
      setStaffs(res.data);
    } catch (err) {
      console.error('Error fetching staff list', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await apiClient.delete(`/staff/${id}`);
      fetchStaffs();
    } catch (err) {
      console.error('Error deleting staff', err);
    }
  };

  // Admin-only on the backend (enforced server-side, not just hidden here).
  // Only Admin verifies Staff, per the planned hierarchy — Staff doesn't
  // verify other Staff.
  const handleSetStatus = async (staff: Staff, verificationStatus: Staff['verificationStatus']) => {
    setUpdatingId(staff.id);
    try {
      await apiClient.patch(`/staff/${staff.id}/verify`, { verificationStatus });
      fetchStaffs();
    } catch (err: any) {
      console.error('Error updating verification status', err);
      alert(err?.response?.data?.message || 'Failed to update verification status.');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Staff List</h2>
        <Button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowAddModal(true)}
        >
          Add Staff
        </Button>
      </div>

      {showAddModal && (
        <AddStaffModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchStaffs}
        />
      )}

      {editStaff && (
        <EditStaffModal
          staff={editStaff}
          onClose={() => setEditStaff(null)}
          onSuccess={fetchStaffs}
        />
      )}

      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Staff ID</th>
            <th className="p-2 border">Department</th>
            <th className="p-2 border">Designation</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody> 
          {staffs.map((staff) => (
            <tr key={staff.id} className="border-t">
              <td className="p-2 border">{staff.name}</td>
              <td className="p-2 border">{staff.email}</td>
              <td className="p-2 border">{staff.phone}</td>
              <td className="p-2 border">{staff.staffId || 'N/A'}</td>
              <td className="p-2 border">{staff.department}</td>
              <td className="p-2 border">{staff.designation}</td>
              <td className="p-2 border">{statusBadge(staff.verificationStatus)}</td>
              <td className="flex p-2 border space-x-2">
                {staff.verificationStatus !== 'VERIFIED' && (
                  <Button
                    onClick={() => handleSetStatus(staff, 'VERIFIED')}
                    disabled={updatingId === staff.id}
                    className="bg-lime-600 text-white px-2 py-4 rounded disabled:opacity-50"
                    title="Approve"
                  >
                    <FaCheck style={{ cursor: 'pointer' }} />
                  </Button>
                )}
                {staff.verificationStatus !== 'REJECTED' && (
                  <Button
                    onClick={() => handleSetStatus(staff, 'REJECTED')}
                    disabled={updatingId === staff.id}
                    className="bg-gray-500 text-white px-2 py-4 rounded disabled:opacity-50"
                    title="Reject"
                  >
                    <FaTimes style={{ cursor: 'pointer' }} />
                  </Button>
                )}
                <Button
                  onClick={() => setEditStaff(staff)}
                  className="bg-green-500 text-white px-2 py-4 rounded"
                >
                  <FaEdit style={{ cursor: 'pointer' }} />
                </Button>
                <Button
                  onClick={() => handleDelete(staff.id)}
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

export default StaffListPage;
