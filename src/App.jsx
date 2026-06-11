import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Loading } from './components/Loading';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Properties from './pages/Properties';
import Leads from './pages/Leads';
import Plans from './pages/Plans';
import Content from './pages/Content';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import System from './pages/System';
import Notifications from './pages/Notifications';
import Projects from './pages/Projects';
import Builders from './pages/Builders';
import Locations from './pages/Locations';
import Feedback from './pages/Feedback';
import Shorts from './pages/Shorts';
import Boost from './pages/Boost';
import MobileHome from './pages/MobileHome';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (booting) return <div className="grid min-h-screen place-items-center bg-slate-50 p-6"><Loading label="Checking admin session..." /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated, booting } = useAuth();
  if (booting) return <div className="grid min-h-screen place-items-center bg-slate-50 p-6"><Loading label="Checking admin session..." /></div>;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="properties" element={<Properties />} />
          <Route path="projects" element={<Projects />} />
          <Route path="builders" element={<Builders />} />
          <Route path="locations" element={<Locations />} />
          <Route path="shorts" element={<Shorts />} />
          <Route path="boost" element={<Boost />} />
          <Route path="mobile-home" element={<MobileHome />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="leads" element={<Leads />} />
          <Route path="plans" element={<Plans />} />
          <Route path="content" element={<Content />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="system" element={<System />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
