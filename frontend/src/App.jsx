import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import MunicipalityRegister from './pages/MunicipalityRegister';
import WaterPlantRegister from './pages/WaterPlantRegister';
import UserDashboard from './pages/user/Dashboard';
import UserWallet from './pages/user/Wallet';
import UserTransactions from './pages/user/Transactions';
import UserEwaste from './pages/user/Ewaste';
import MunicipalityDashboard from './pages/municipality/Dashboard';
import WaterPlantDashboard from './pages/waterplant/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminTransactions from './pages/admin/Transactions';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public Route - redirect if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (user) {
    // Redirect based on role
    switch (user.role) {
      case 'user':
        return <Navigate to="/dashboard" replace />;
      case 'municipality':
        return <Navigate to="/municipality" replace />;
      case 'waterplant':
        return <Navigate to="/waterplant" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/register/municipality"
            element={
              <PublicRoute>
                <MunicipalityRegister />
              </PublicRoute>
            }
          />
          <Route
            path="/register/waterplant"
            element={
              <PublicRoute>
                <WaterPlantRegister />
              </PublicRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserWallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserTransactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ewaste"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserEwaste />
              </ProtectedRoute>
            }
          />

          {/* Municipality Routes */}
          <Route
            path="/municipality"
            element={
              <ProtectedRoute allowedRoles={['municipality', 'admin']}>
                <MunicipalityDashboard />
              </ProtectedRoute>
            }
          />

          {/* Water Plant Routes */}
          <Route
            path="/waterplant"
            element={
              <ProtectedRoute allowedRoles={['waterplant', 'admin']}>
                <WaterPlantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTransactions />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-primary-600">404</h1>
                  <p className="text-xl text-gray-600 mt-4">Page not found</p>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
