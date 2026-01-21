import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLeaf, FaHome, FaWallet, FaExchangeAlt, FaRecycle, FaUsers, FaChartBar, FaSignOutAlt, FaTint, FaBuilding } from 'react-icons/fa';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Navigation items based on role
    const getNavItems = () => {
        switch (user?.role) {
            case 'user':
                return [
                    { path: '/dashboard', icon: FaHome, label: 'Dashboard' },
                    { path: '/wallet', icon: FaWallet, label: 'Wallet' },
                    { path: '/transactions', icon: FaExchangeAlt, label: 'Transactions' },
                    { path: '/ewaste', icon: FaRecycle, label: 'E-Waste' },
                ];
            case 'municipality':
                return [
                    { path: '/municipality', icon: FaBuilding, label: 'Dashboard' },
                ];
            case 'waterplant':
                return [
                    { path: '/waterplant', icon: FaTint, label: 'Dashboard' },
                ];
            case 'admin':
                return [
                    { path: '/admin', icon: FaChartBar, label: 'Dashboard' },
                    { path: '/admin/users', icon: FaUsers, label: 'Users' },
                    { path: '/admin/transactions', icon: FaExchangeAlt, label: 'Transactions' },
                ];
            default:
                return [];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                                <FaLeaf className="text-xl text-white" />
                            </div>
                            <span className="ml-3 text-xl font-bold text-gray-900">
                                E-Waste Platform
                            </span>
                        </div>

                        {/* User Info & Logout */}
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary flex items-center space-x-2"
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
                    <nav className="p-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-primary-50 text-primary-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className={isActive ? 'text-primary-600' : 'text-gray-400'} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
