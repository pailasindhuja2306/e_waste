import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import QRCode from 'react-qr-code';
import { FaWallet, FaRecycle, FaDownload, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../../utils/api';

export default function UserDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await api.get('/user/dashboard');
            setDashboard(response.data.data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        canvas.width = 256;
        canvas.height = 256;

        img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = 'my-ewaste-qr.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
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
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome to your E-Waste wallet</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Wallet Balance */}
                    <div className="card-municipal p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
                                <FaWallet className="text-2xl text-primary-600" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Wallet Balance</h3>
                        <p className="text-3xl font-bold text-gray-900">
                            ₹{dashboard?.wallet?.balance?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                            {dashboard?.wallet?.frozen ? (
                                <span className="badge badge-danger">Frozen</span>
                            ) : (
                                <span className="badge badge-success">Active</span>
                            )}
                        </p>
                    </div>

                    {/* Total Credits */}
                    <div className="card-municipal p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                                <FaArrowUp className="text-2xl text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Credits</h3>
                        <p className="text-3xl font-bold text-green-600">
                            ₹{dashboard?.wallet?.totalCredits?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    {/* Total Debits */}
                    <div className="card-municipal p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                                <FaArrowDown className="text-2xl text-red-600" />
                            </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">Total Debits</h3>
                        <p className="text-3xl font-bold text-red-600">
                            ₹{dashboard?.wallet?.totalDebits?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* QR Code Card */}
                    <div className="card-municipal p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Your QR Code</h2>
                        <div className="flex flex-col items-center">
                            {dashboard?.qr?.token ? (
                                <>
                                    <div className="bg-white p-4 rounded-xl border-4 border-primary-200">
                                        <QRCode
                                            id="qr-code-svg" // Added ID for potential download functionality
                                            value={dashboard.qr.token}
                                            size={200}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 200 200`}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600 mt-4 text-center">
                                        Show this QR code at municipality or water plant
                                    </p>
                                    <button
                                        onClick={downloadQR}
                                        className="btn btn-primary mt-4 flex items-center space-x-2"
                                    >
                                        <FaDownload />
                                        <span>Download QR Code</span>
                                    </button>
                                    <div className="mt-4 text-xs text-gray-500">
                                        <p>Scanned {dashboard.qr.scanCount} times</p>
                                        {dashboard.qr.lastScannedAt && (
                                            <p>Last scan: {format(new Date(dashboard.qr.lastScannedAt), 'PPp')}</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-500">QR code not available</p>
                            )}
                        </div>
                    </div>

                    {/* E-Waste Stats */}
                    <div className="card-municipal p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">E-Waste Statistics</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                                        <FaRecycle className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Submissions</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {dashboard?.ewasteStats?.totalSubmissions || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Total Value Earned</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        ₹{dashboard?.ewasteStats?.totalValue?.toFixed(2) || '0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {dashboard.recentTransactions.map((transaction) => (
                                        <tr key={transaction._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {format(new Date(transaction.createdAt), 'PPp')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {transaction.type === 'credit' ? (
                                                    <span className="badge badge-success">Credit</span>
                                                ) : (
                                                    <span className="badge badge-danger">Debit</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {transaction.description}
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
