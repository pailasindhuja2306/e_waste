import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { format } from 'date-fns';
import { FaRecycle } from 'react-icons/fa';
import api from '../../utils/api';

export default function UserEwaste() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEwaste();
    }, []);

    const fetchEwaste = async () => {
        try {
            const response = await api.get('/user/ewaste');
            setData(response.data.data);
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
                <h1 className="text-3xl font-bold text-gray-900">E-Waste Submissions</h1>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-municipal p-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <FaRecycle className="text-2xl text-primary-600" />
                            <h3 className="text-sm font-medium text-gray-600">Total Submissions</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {data?.stats?.totalSubmissions || 0}
                        </p>
                    </div>

                    <div className="card-municipal p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Value Earned</h3>
                        <p className="text-3xl font-bold text-green-600">
                            ₹{data?.stats?.totalValue?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    <div className="card-municipal p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Quantity</h3>
                        <p className="text-3xl font-bold text-primary-600">
                            {data?.stats?.totalQuantity?.toFixed(2) || '0'} units
                        </p>
                    </div>
                </div>

                {/* E-Waste List */}
                <div className="card-municipal p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Submission History</h2>
                    {data?.ewaste?.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified By</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {data.ewaste.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {format(new Date(item.createdAt), 'PPp')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{item.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {item.quantity} {item.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="badge badge-primary capitalize">{item.condition}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {item.verifiedBy?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 text-right">
                                                ₹{item.totalValue.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No e-waste submissions yet</p>
                    )}
                </div>
            </div>
        </Layout>
    );
}
