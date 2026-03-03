import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('./pages/Landing/LandingPage'));
const SimulatorPage = lazy(() => import('./pages/Simulator/SimulatorPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorks/HowItWorksPage'));
const AboutPage = lazy(() => import('./pages/About/AboutPage'));
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const ScenariosPage = lazy(() => import('./pages/Scenarios/ScenariosPage'));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="text-accent-cyan animate-pulse text-lg font-mono">Loading...</div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/scenarios" element={<ScenariosPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Suspense>
  );
}
