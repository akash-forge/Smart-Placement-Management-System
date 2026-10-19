import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import AddCompanyModal from '../Forms/AddCompanyModal';
import Button from '../../components/ui/button/Button';
import EditCompanyModal from '../Forms/EditCompanyModal';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  website?: string;
  address?: string;
  industry?: string;
  description?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

const statusBadge = (status: Company['verificationStatus']) => {
  const styles =
    status === 'VERIFIED'
      ? 'bg-lime-100 text-lime-700'
      : status === 'REJECTED'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700';
  const label = status === 'VERIFIED' ? 'Verified' : status === 'REJECTED' ? 'Rejected' : 'Pending';
  return <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${styles}`}>{label}</span>;
};


const CompanyListPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchCompanies = async () => {
    try {
      const res = await apiClient.get('/company');
      setCompanies(res.data);
    } catch (err) {
      console.error('Error fetching companies', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    try {
      await apiClient.delete(`/company/${id}`);
      fetchCompanies();
    } catch (err) {
      console.error('Error deleting company', err);
    }
  };

  // Admin-only on the backend (enforced server-side regardless of what this
  // UI shows).
  const handleSetStatus = async (company: Company, verificationStatus: Company['verificationStatus']) => {
    setUpdatingId(company.id);
    try {
      await apiClient.patch(`/company/${company.id}/verify`, { verificationStatus });
      fetchCompanies();
    } catch (err: any) {
      console.error('Error updating verification status', err);
      alert(err?.response?.data?.message || 'Failed to update verification status.');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Company List</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          Add Company
        </button>
      </div>

      {showModal && (
        <AddCompanyModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchCompanies}
        />
      )}
      {editCompany && (
        <EditCompanyModal
          company={editCompany}
          onClose={() => setEditCompany(null)}
          onSuccess={fetchCompanies}
        />
      )}
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Website</th>
            <th className="p-2 border">Address</th>
            <th className="p-2 border">Industry</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="border-t">
              <td className="p-2 border">{company.name}</td>
              <td className="p-2 border">{company.email}</td>
              <td className="p-2 border">{company.phone}</td>
              <td className="p-2 border">{company.website}</td>
              <td className="p-2 border">{company.address}</td>
              <td className="p-2 border">{company.industry}</td>
              <td className="p-2 border">{statusBadge(company.verificationStatus)}</td>
              <td className="p-2 border space-x-2 flex">
                {company.verificationStatus !== 'VERIFIED' && (
                  <Button
                    onClick={() => handleSetStatus(company, 'VERIFIED')}
                    disabled={updatingId === company.id}
                    className="bg-lime-600 text-white px-2 py-4 rounded disabled:opacity-50"
                    title="Approve"
                  >
                    <FaCheck style={{ cursor: 'pointer' }} />
                  </Button>
                )}
                {company.verificationStatus !== 'REJECTED' && (
                  <Button
                    onClick={() => handleSetStatus(company, 'REJECTED')}
                    disabled={updatingId === company.id}
                    className="bg-gray-500 text-white px-2 py-4 rounded disabled:opacity-50"
                    title="Reject"
                  >
                    <FaTimes style={{ cursor: 'pointer' }} />
                  </Button>
                )}
                <Button
                  onClick={() => setEditCompany(company)}
                  className="bg-green-500 text-white px-2 py-4 rounded"
                >
                  <FaEdit style={{ cursor: 'pointer' }} />
                </Button>
                <Button
                  onClick={() => handleDelete(company.id)}
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


export default CompanyListPage;
