import '@/App.css';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Goals from './pages/Goals';
import Ritual from './pages/Ritual';
import Progress from './pages/Progress';
import Upgrade from './pages/Upgrade';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

const MainLayout = () => (
    <div className="min-h-screen bg-aligna-bg">
        <Navigation />
        <main className="pb-24 md:pb-0 md:pt-20">
            <Outlet />
        </main>
    </div>
);

function App() {
    return (
        <ErrorBoundary>
            <div className="App">
                <BrowserRouter>
                    <AuthProvider>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/login" element={<Landing />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/contact" element={<Contact />} />

                            {/* Protected app routes */}
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

                            {/* 404 */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </AuthProvider>
                </BrowserRouter>
            </div>
        </ErrorBoundary>
    );
}

export default App;
