import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import ProtectedRoute from '../routes/ProtectedRoute';

// Componente de loading
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-orbit-primary border-t-transparent rounded-full animate-spin" />
    </div>
);

// ==================== PÁGINAS DE AUTH ====================
const SignInPage = lazy(() => import('@/pages/auth/SignInPage'));
const SignUpPage = lazy(() => import('@/pages/auth/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));

// ==================== PÁGINAS PRINCIPALES ====================
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const BillingPage = lazy(() => import('@/pages/billing/BillingPage'));
const ContactsPage = lazy(() => import('@/pages/crm/ContactsPage'));
const ChatPage = lazy(() => import('@/pages/ai/ChatPage'));
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'));
const HelpPage = lazy(() => import('@/pages/help/HelpPage'));
const ComponentsPage = lazy(() => import('@/pages/components/ComponentsPage'));

const SegmentacionSalarial = lazy(() => import('@/pages/asociados/SegmentacionSalarial'));
const Fase1Asociacion = lazy(() => import('@/pages/asociados/Fase1Asociacion'));
const Fase2Asociacion = lazy(() => import('@/pages/asociados/Fase2Asociacion'));
const LinksAfiliacionPage = lazy(() => import('@/pages/asociados/LinksAfiliacionPage'));
// ==================== PÁGINAS PÚBLICAS ====================
const AfiliacionPage = lazy(() => import('@/pages/public/Afiliacion'));

export const AppRoutes = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* ✅ Rutas públicas - Sin autenticación */}
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/afiliacion/:codigo" element={<AfiliacionPage />} />
                <Route path="/afiliacion" element={<AfiliacionPage />} />

                {/* ✅ Rutas protegidas - Requieren autenticación */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/asociados" element={<SegmentacionSalarial />} />
                        <Route path="/asociaciones/F1" element={<Fase1Asociacion />} />
                        <Route path="/asociaciones/F2" element={<Fase2Asociacion />} />
                        <Route path="/links" element={<LinksAfiliacionPage />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/billing" element={<BillingPage />} />
                        <Route path="/crm/contacts" element={<ContactsPage />} />
                        <Route path="/ai/chat" element={<ChatPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/help" element={<HelpPage />} />
                        <Route path="/components" element={<ComponentsPage />} />
                    </Route>
                </Route>

                {/* ✅ Ruta 404 - No encontrada */}
                <Route path="*" element={<Navigate to="/sign-in" replace />} />
            </Routes>
        </Suspense>
    );
};