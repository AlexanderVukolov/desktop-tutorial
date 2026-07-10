import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { AppShell } from './components/layout/AppShell';
import { PortalShell } from './components/portal/PortalShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ClientDetail } from './pages/ClientDetail';
import { ClientReport } from './pages/ClientReport';
import { Calendar } from './pages/Calendar';
import { Planner } from './pages/Planner';
import { Kbju } from './pages/Kbju';
import { FoodCalculator } from './pages/FoodCalculator';
import { MyCabinet } from './pages/MyCabinet';
import { Partner } from './pages/Partner';
import { Career } from './pages/Career';
import { Knowledge } from './pages/Knowledge';
import { WellnessNews } from './pages/WellnessNews';
import { Community } from './pages/Community';
import { Settings } from './pages/Settings';
import { Diary } from './pages/portal/Diary';
import { Progress } from './pages/portal/Progress';
import { Chat } from './pages/portal/Chat';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="clients/:id/report" element={<ClientReport />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="planner" element={<Planner />} />
          <Route path="kbju" element={<Kbju />} />
          <Route path="food-calculator" element={<FoodCalculator />} />
          <Route path="my-cabinet" element={<MyCabinet />} />
          <Route path="partner" element={<Partner />} />
          <Route path="career" element={<Career />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="wellness-news" element={<WellnessNews />} />
          <Route path="community" element={<Community />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="/client/:clientId" element={<PortalShell />}>
        <Route index element={<Diary />} />
        <Route path="progress" element={<Progress />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
