import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import CreateUserModal from '../../components/CreateUserModal';
import { FaPlus, FaEdit, FaTrash, FaLock, FaUnlock } from 'react-icons/fa';
import api from '../../utils/api';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalUserType, setModalUserType] = useState('user');

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const fetchUsers = async () => {
        try {
            const params = filter !== 'all' ? { role: filter } : {};
            const response = await api.get('/admin/users', { params });
            setUsers(response.data.data.users);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        if (!confirm('Are you sure you want to change user status?')) return;

        try {
            const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
            await api.patch(`/admin/users/${userId}`, { status: newStatus });
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update user');
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('user')}
                            className={`btn ${filter === 'user' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => setFilter('municipality')}
                            className={`btn ${filter === 'municipality' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Municipality
                        </button>
                        <button
                            onClick={() => setFilter('waterplant')}
                            className={`btn ${filter === 'waterplant' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Water Plant
                        </button>
                    </div>
                </div>

                {/* Create Buttons */}
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            setModalUserType('municipality');
                            setModalOpen(true);
                        }}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <FaPlus />
                        <span>Create Municipality Officer</span>
                    </button>
                    <button
                        onClick={() => {
                            setModalUserType('waterplant');
                            setModalOpen(true);
                        }}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <FaPlus />
                        <span>Create Water Plant Officer</span>
                    </button>
                </div>

                <div className="card-municipal p-6">
                    {users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{user.phone}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="badge badge-primary capitalize">{user.role}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.status === 'active' ? (
                                                    <span className="badge badge-success">Active</span>
                                                ) : (
                                                    <span className="badge badge-danger">Suspended</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => toggleUserStatus(user._id, user.status)}
                                                        className="text-primary-600 hover:text-primary-900"
                                                        title={user.status === 'active' ? 'Suspend' : 'Activate'}
                                                    >
                                                        {user.status === 'active' ? <FaLock /> : <FaUnlock />}
                                                    </button>
                                                    {user.role !== 'admin' && (
                                                        <button
                                                            onClick={() => deleteUser(user._id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No users found</p>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            <CreateUserModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetchUsers}
                userType={modalUserType}
            />
        </Layout>
    );
}
