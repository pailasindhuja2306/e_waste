import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaQrcode, FaRecycle, FaCoins } from 'react-icons/fa';
import api from '../../utils/api';

export default function MunicipalityDashboard() {
    const [scanning, setScanning] = useState(false);
    const [scannedUser, setScannedUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const presetAmounts = [5, 10, 15, 20];

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/municipality/stats');
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

        scanner.render(onScanSuccess, onScanError);

        async function onScanSuccess(decodedText) {
            scanner.clear();
            setScanning(false);

            try {
                const response = await api.post('/municipality/scan-qr', {
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

        function onScanError(error) {
            // Ignore scan errors
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Determine which amount to use
        const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;

        if (!finalAmount) {
            setMessage({ type: 'error', text: 'Please select or enter an amount' });
            return;
        }

        if (finalAmount <= 0) {
            setMessage({ type: 'error', text: 'Amount must be greater than 0' });
            return;
        }

        if (finalAmount > 1000) {
            setMessage({ type: 'error', text: 'Amount cannot exceed ₹1000' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await api.post('/municipality/add-credit', {
                qrToken: scannedUser.user.qrToken,
                amount: finalAmount,
                notes: notes || `E-waste verification - ₹${finalAmount}`
            });

            setMessage({ type: 'success', text: `₹${finalAmount} credit added successfully!` });
            setScannedUser(null);
            setSelectedAmount(null);
            setCustomAmount('');
            setNotes('');
            fetchStats();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to add credit'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900">Municipality Dashboard</h1>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-municipal p-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <FaRecycle className="text-2xl text-primary-600" />
                            <h3 className="text-sm font-medium text-gray-600">Total E-Waste</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">
                            {stats?.totalEwaste || 0}
                        </p>
                    </div>

                    <div className="card-municipal p-6">
                        <div className="flex items-center space-x-3 mb-2">
                            <FaCoins className="text-2xl text-green-600" />
                            <h3 className="text-sm font-medium text-gray-600">Total Value Added</h3>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            ₹{stats?.totalValue?.toFixed(2) || '0.00'}
                        </p>
                    </div>

                    <div className="card-municipal p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">Total Quantity</h3>
                        <p className="text-3xl font-bold text-primary-600">
                            {stats?.totalQuantity?.toFixed(2) || '0'} units
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* QR Scanner */}
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
                                <div className="bg-primary-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-900">{scannedUser.user.name}</h3>
                                    <p className="text-sm text-gray-600">{scannedUser.user.email}</p>
                                    <p className="text-sm text-gray-600">{scannedUser.user.phone}</p>
                                    <p className="text-lg font-bold text-primary-600 mt-2">
                                        Balance: ₹{scannedUser.wallet.balance.toFixed(2)}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="label">Quick Select Amount</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {presetAmounts.map((amount) => (
                                                <button
                                                    key={amount}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedAmount(amount);
                                                        setCustomAmount(''); // Clear custom when preset selected
                                                    }}
                                                    className={`p-4 rounded-lg border-2 transition-all ${selectedAmount === amount && !customAmount
                                                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                        : 'border-gray-300 hover:border-primary-400'
                                                        }`}
                                                >
                                                    <div className="text-2xl font-bold">₹{amount}</div>
                                                    <div className="text-xs text-gray-600">Quick</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white text-gray-500">OR</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">Custom Amount (₹)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1000"
                                            value={customAmount}
                                            onChange={(e) => {
                                                setCustomAmount(e.target.value);
                                                setSelectedAmount(null); // Clear preset when custom entered
                                            }}
                                            className="input"
                                            placeholder="Enter custom amount (max ₹1000)"
                                        />
                                        {customAmount && (
                                            <p className="text-sm text-primary-600 mt-2">
                                                Custom: ₹{parseFloat(customAmount).toFixed(2)}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="label">Notes (Optional)</label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="input"
                                            rows="2"
                                            placeholder="E-waste verification notes..."
                                        />
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            type="submit"
                                            disabled={loading || (!selectedAmount && !customAmount)}
                                            className="flex-1 btn btn-primary"
                                        >
                                            {loading ? 'Adding Credit...' : 'Add Credit'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setScannedUser(null);
                                                setSelectedAmount(null);
                                                setCustomAmount('');
                                                setNotes('');
                                            }}
                                            className="flex-1 btn btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Info Card */}
                    <div className="card-municipal p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Credit Options</h2>
                        <div className="space-y-3">
                            <p className="text-gray-600 text-sm mb-4">
                                Quick select preset amounts or enter custom amount:
                            </p>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-700 uppercase">Preset Amounts</p>
                                {presetAmounts.map((amount) => (
                                    <div key={amount} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="font-semibold text-gray-900">₹{amount}</span>
                                        <span className="text-sm text-gray-600">
                                            {amount === 5 && 'Small items'}
                                            {amount === 10 && 'Medium items'}
                                            {amount === 15 && 'Large items'}
                                            {amount === 20 && 'Premium items'}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-200">
                                <p className="text-sm font-medium text-primary-900">Custom Amount</p>
                                <p className="text-xs text-primary-700 mt-1">
                                    Enter any amount from ₹0.01 to ₹1000 for specific verification needs
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
