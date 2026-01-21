import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import api from '../utils/api';

export default function CreateUserModal({ isOpen, onClose, onSuccess, userType = 'user' }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: userType
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/admin/users', formData);
            onSuccess();
            onClose();
            setFormData({ name: '', email: '', phone: '', password: '', role: userType });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const titles = {
        user: 'Create User',
        municipality: 'Create Municipality Officer',
        waterplant: 'Create Water Plant Officer'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{titles[userType]}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input"
                            required
                        />
                    </div>

                    <div>
                        <label className="label">Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input"
                            minLength="8"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                    </div>

                    <div className="flex space-x-2 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn btn-primary"
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 btn btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
