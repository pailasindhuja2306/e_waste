import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaQrcode, FaTint, FaCoins } from 'react-icons/fa';
import api from '../../utils/api';

export default function WaterPlantDashboard() {
    const [scanning, setScanning] = useState(false);
    const [scannedUser, setScannedUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [formData, setFormData] = useState({
        amount: '',
        serviceType: 'Water Bill Payment',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/waterplant/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const startScanning = () => {
        setScanning(true);
        setScannedUser(null);
        setMessage(null);

        const scanner = new Html5QrcodeScanner('qr-reader', {
            fps: 10,
            qrbox: 250
        });

        scanner.render(onScanSuccess);

        async function onScanSuccess(decodedText) {
            scanner.clear();
            setScanning(false);

            try {
                const response = await api.post('/waterplant/scan-qr', {
                    qrToken: decodedText
                });
                setScannedUser(response.data.data);
                setMessage({ type: 'success', text: 'QR code scanned successfully!' });
            } catch (error) {
                setMessage({
                    type: 'error',
                    text: error.response?.data?.message || 'Failed to scan QR code'
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await api.post('/waterplant/deduct', {
                qrToken: scannedUser.user.qrToken,
                amount: parseFloat(formData.amount),
                serviceType: formData.serviceType,
                description: formData.description || `${formData.serviceType} - ₹${formData.amount}`
            });

            setMessage({ type: 'success', text: 'Amount deducted successfully!' });
            setScannedUser(null);
            setFormData({ amount: '', serviceType: 'Water Bill Payment', description: '' });
            fetchStats();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to deduct amount'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Water Plant Dashboard</h1>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card-municipal p-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <FaTint className="text-2xl text-blue-600" />
                            <h3 className="text-sm font-medium text-gray-600">Total Transactions</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {stats?.totalTransactions || 0}
                        </p>
                    </div>

                    <div className="card-municipal p-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <FaCoins className="text-2xl text-green-600" />
                            <h3 className="text-sm font-medium text-gray-600">Total Amount Collected</h3>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            ₹{stats?.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                    </div>
                </div>

                <div className="card-municipal p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Scan User QR Code</h2>

                    {message && (
                        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {!scanning && !scannedUser && (
                        <button
                            onClick={startScanning}
                            className="w-full btn btn-primary py-4 flex items-center justify-center space-x-2"
                        >
                            <FaQrcode className="text-xl" />
                            <span>Start QR Scanner</span>
                        </button>
                    )}

                    {scanning && (
                        <div>
                            <div id="qr-reader" className="w-full"></div>
                            <button
                                onClick={() => {
                                    setScanning(false);
                                    const scanner = document.getElementById('qr-reader');
                                    if (scanner) scanner.innerHTML = '';
                                }}
                                className="w-full btn btn-secondary mt-4"
                            >
                                Cancel Scanning
                            </button>
                        </div>
                    )}

                    {scannedUser && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900">{scannedUser.user.name}</h3>
                                <p className="text-sm text-gray-600">{scannedUser.user.email}</p>
                                <p className="text-sm text-gray-600">{scannedUser.user.phone}</p>
                                <p className="text-lg font-bold text-blue-600 mt-2">
                                    Balance: ₹{scannedUser.wallet.balance.toFixed(2)}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="label">Service Type</label>
                                    <select
                                        value={formData.serviceType}
                                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                        className="input"
                                        required
                                    >
                                        <option value="Water Bill Payment">Water Bill Payment</option>
                                        <option value="Connection Fee">Connection Fee</option>
                                        <option value="Maintenance Charge">Maintenance Charge</option>
                                        <option value="Other Service">Other Service</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label">Amount (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="input"
                                        placeholder="Enter amount"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="label">Description (Optional)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input"
                                        rows="2"
                                        placeholder="Additional details"
                                    />
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 btn btn-primary"
                                    >
                                        {loading ? 'Deducting...' : 'Deduct Amount'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setScannedUser(null)}
                                        className="flex-1 btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
