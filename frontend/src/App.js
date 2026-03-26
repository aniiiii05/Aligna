import '@/App.css';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import AuthCallback from './pages/AuthCallback';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Goals from './pages/Goals';
import Ritual from './pages/Ritual';
import Progress from './pages/Progress';
import Upgrade from './pages/Upgrade';
import Settings from './pages/Settings';

const MainLayout = () => (
    <div className="min-h-screen bg-aligna-bg">
        <Navigation />
        <main className="pb-24 md:pb-0 md:pt-20">
            <Outlet />
        </main>
    </div>
);

const AppRouter = () => {
    const location = useLocation();

    // Handle OAuth callback synchronously to prevent race condition
    if (location.hash?.includes('session_id=')) {
        return <AuthCallback />;
    }

    return (
        <Routes>
            <Route path="/login" element={<Landing />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Home />} />
                <Route path="goals" element={<Goals />} />
                <Route path="ritual" element={<Ritual />} />
                <Route path="progress" element={<Progress />} />
                <Route path="upgrade" element={<Upgrade />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    );
};

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <AuthProvider>
                    <AppRouter />
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
