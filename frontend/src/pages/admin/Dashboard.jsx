import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { FaUsers, FaWallet, FaExchangeAlt, FaRecycle } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../../utils/api';

export default function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/admin/dashboard');
            setDashboard(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
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

    const usersByRole = dashboard?.usersByRole || [];
    const walletStats = dashboard?.walletStats || {};
    const transactionStats = dashboard?.transactionStats || [];
    const ewasteStats = dashboard?.ewasteStats || {};

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

                {/* User Stats by Role */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {usersByRole.map((item) => (
                        <div key={item._id} className="card-municipal p-6">
                            <div className="flex items-center space-x-3 mb-2">
                                <FaUsers className="text-2xl text-primary-600" />
                                <h3 className="text-sm font-medium text-gray-600 capitalize">{item._id}s</h3>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">{item.count}</p>
                        </div>
                    ))}
                </div>

                {/* Wallet Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="card-municipal p-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <FaWallet className="text-2xl text-blue-600" />
                            <h3 className="text-sm font-medium text-gray-600">Total Wallets</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{walletStats.totalWallets || 0}</p>
                    </div>

                    <div className="card-municipal p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Balance</h3>
                        <p className="text-3xl font-bold text-primary-600">
                            ₹{walletStats.totalBalance?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    <div className="card-municipal p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Credits</h3>
                        <p className="text-3xl font-bold text-green-600">
                            ₹{walletStats.totalCredits?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    <div className="card-municipal p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Debits</h3>
                        <p className="text-3xl font-bold text-red-600">
                            ₹{walletStats.totalDebits?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                </div>

                {/* E-Waste Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-municipal p-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <FaRecycle className="text-2xl text-green-600" />
                            <h3 className="text-sm font-medium text-gray-600">Total E-Waste</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {ewasteStats.totalSubmissions || 0}
                        </p>
                    </div>

                    <div className="card-municipal p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">E-Waste Value</h3>
                        <p className="text-3xl font-bold text-green-600">
                            ₹{ewasteStats.totalValue?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    <div className="card-municipal p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Quantity</h3>
                        <p className="text-3xl font-bold text-primary-600">
                            {ewasteStats.totalQuantity?.toFixed(2) || '0'} units
                        </p>
                    </div>
                </div>

                {/* Transaction Stats */}
                <div className="card-municipal p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {transactionStats.map((item) => (
                            <div key={item._id} className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 capitalize">{item._id} Transactions</p>
                                <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                                <p className="text-lg font-semibold text-primary-600">
                                    ₹{item.total.toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="card-municipal p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
                    {dashboard?.recentTransactions?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {dashboard.recentTransactions.map((transaction) => (
                                        <tr key={transaction._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {format(new Date(transaction.createdAt), 'PPp')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {transaction.userId?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {transaction.type === 'credit' ? (
                                                    <span className="badge badge-success">Credit</span>
                                                ) : (
                                                    <span className="badge badge-danger">Debit</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {transaction.performedBy?.name || 'System'}
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No transactions yet</p>
                    )}
                </div>
            </div>
        </Layout>
    );
}
