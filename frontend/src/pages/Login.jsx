import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLeaf, FaEnvelope, FaLock } from 'react-icons/fa';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);

        if (result.success) {
            // Redirect based on role
            switch (result.user.role) {
                case 'user':
                    navigate('/dashboard');
                    break;
                case 'municipality':
                    navigate('/municipality');
                    break;
                case 'waterplant':
                    navigate('/waterplant');
                    break;
                case 'admin':
                    navigate('/admin');
                    break;
                default:
                    navigate('/dashboard');
            }
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
                        <FaLeaf className="text-3xl text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        E-Waste Management
                    </h1>
                    <p className="text-gray-600">
                        Sign in to your account
                    </p>
                </div>

                {/* Login Form */}
                <div className="card-municipal p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="label">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input pl-10"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="label">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-3 text-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <div className="spinner mr-2" style={{ width: '20px', height: '20px' }}></div>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
                    <p className="text-sm font-medium text-primary-900 mb-2">Demo Credentials:</p>
                    <div className="text-xs text-primary-700 space-y-1">
                        <p><strong>Admin:</strong> superadmin@ewaste.gov / superadmin@123456</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
