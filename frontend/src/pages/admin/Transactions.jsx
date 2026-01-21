import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { format } from 'date-fns';
import api from '../../utils/api';

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTransactions();
    }, [filter]);

    const fetchTransactions = async () => {
        try {
            const params = filter !== 'all' ? { type: filter } : {};
            const response = await api.get('/admin/transactions', { params });
            setTransactions(response.data.data.transactions);
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

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">All Transactions</h1>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('credit')}
                            className={`btn ${filter === 'credit' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Credits
                        </button>
                        <button
                            onClick={() => setFilter('debit')}
                            className={`btn ${filter === 'debit' ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            Debits
                        </button>
                    </div>
                </div>

                <div className="card-municipal p-6">
                    {transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {transactions.map((transaction) => (
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="badge badge-primary">{transaction.category}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {transaction.description}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {transaction.performedBy?.name || 'System'}
                                                <span className="text-xs text-gray-400 ml-1">
                                                    ({transaction.performedByRole})
                                                </span>
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
                        <p className="text-gray-500 text-center py-8">No transactions found</p>
                    )}
                </div>
            </div>
        </Layout>
    );
}
