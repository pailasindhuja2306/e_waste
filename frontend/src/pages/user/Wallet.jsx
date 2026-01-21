import Layout from '../../components/Layout';
import QRCode from 'react-qr-code';
import { useState, useEffect } from 'react';
import { FaDownload, FaWallet } from 'react-icons/fa';
import api from '../../utils/api';

export default function UserWallet() {
    const [wallet, setWallet] = useState(null);
    const [qr, setQR] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [walletRes, qrRes] = await Promise.all([
                api.get('/user/wallet'),
                api.get('/user/qr')
            ]);
            setWallet(walletRes.data.data);
            setQR(qrRes.data.data);
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
                <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card-municipal p-8">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-xl">
                                <FaWallet className="text-3xl text-primary-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Current Balance</p>
                                <p className="text-4xl font-bold text-gray-900">
                                    ₹{wallet?.balance?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                            <div>
                                <p className="text-xs text-gray-500">Total Credits</p>
                                <p className="text-xl font-semibold text-green-600">
                                    ₹{wallet?.totalCredits?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Debits</p>
                                <p className="text-xl font-semibold text-red-600">
                                    ₹{wallet?.totalDebits?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-xs text-gray-500">Status</p>
                            {wallet?.frozen ? (
                                <span className="badge badge-danger mt-1">Frozen</span>
                            ) : (
                                <span className="badge badge-success mt-1">Active</span>
                            )}
                        </div>
                    </div>

                    <div className="card-municipal p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Your QR Code</h2>
                        <div className="flex flex-col items-center">
                            {qr?.qrImage ? (
                                <>
                                    <div className="bg-white p-4 rounded-xl border-4 border-primary-200">
                                        <QRCode
                                            value={qr.token}
                                            size={220}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 220 220`}
                                        />
                                    </div>
                                    <button className="btn btn-primary mt-6 flex items-center space-x-2">
                                        <FaDownload />
                                        <span>Download QR</span>
                                    </button>
                                </>
                            ) : (
                                <p className="text-gray-500">QR code not available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
