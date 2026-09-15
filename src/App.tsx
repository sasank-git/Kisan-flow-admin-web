import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Tractor } from 'lucide-react';
import { KisanFlowProvider, useKisanFlow } from './context/KisanFlowContext';

// Import the new Landing Page!
import { AdminLandingPage } from './components/AdminLandingPage';

// ⚠️ NO HEADER IMPORT HERE ⚠️
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GateQrScannerModal } from './components/admin/GateQrScannerModal';
import { Login } from './components/Login';

// --- NEW: Landing Route Wrapper ---
// We create this tiny component so we can use the 'useNavigate' hook to send the user to the login page.
const LandingRoute = () => {
  const navigate = useNavigate();
  return <AdminLandingPage onEnter={() => navigate('/login')} />;
};

const AdminLayout: React.FC = () => {
  const { isGateScannerOpen, scannerTargetToken, closeGateScanner } = useKisanFlow();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* CLEAN LOGO BAR - NO PRESENTATION CONTROLS */}
      <div className="w-full px-6 py-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center gap-2 z-50">
         <Tractor className="w-6 h-6 text-emerald-400" />
         <span className="font-heading font-bold text-xl text-white">KisanFlow Admin Command</span>
      </div>
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <AdminDashboard />
        </div>
      </main>

      <GateQrScannerModal 
        isOpen={isGateScannerOpen} 
        onClose={closeGateScanner} 
        targetTokenNumber={scannerTargetToken}
        onCheckInSuccess={() => {
          window.dispatchEvent(new CustomEvent('kisanflow:tokens-updated'));
        }}
      />

      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Tractor className="w-4 h-4 text-emerald-400" />
            <span className="font-heading font-bold text-white">KisanFlow</span>
            <span>— Admin Command Centre</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <KisanFlowProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. The Landing Page is now your main entry point */}
          <Route path="/" element={<LandingRoute />} />
          
          {/* 2. Your Login Screen */}
          <Route path="/login" element={<Login />} />
          
          {/* 3. The actual Dashboard is moved to a secure /dashboard route */}
          <Route path="/dashboard" element={<AdminLayout />} />
          
          {/* Fallback to Landing Page if an unknown URL is entered */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </KisanFlowProvider>
  );
}