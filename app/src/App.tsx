import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { AppShell } from './components/layout/AppShell';
import { PortalShell } from './components/portal/PortalShell';
import { Login } from './pages/Login';
import { ClientDetail } from './pages/ClientDetail';
import { ClientReport } from './pages/ClientReport';
import { Calendar } from './pages/Calendar';
import { Kbju } from './pages/Kbju';
import { FoodCalculator } from './pages/FoodCalculator';
import { MyCabinet } from './pages/MyCabinet';
import { Recipes } from './pages/Recipes';
import { Career } from './pages/Career';
import { Knowledge } from './pages/Knowledge';
import { WellnessNews } from './pages/WellnessNews';
import { Community } from './pages/Community';
import { Settings } from './pages/Settings';
import { Diary } from './pages/portal/Diary';
import { Progress } from './pages/portal/Progress';
import { Lifestyle as PortalLifestyle } from './pages/portal/Lifestyle';
import { Recipes as PortalRecipes } from './pages/portal/Recipes';
import { Chat } from './pages/portal/Chat';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/my-cabinet" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="my-cabinet" replace />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="clients/:id/report" element={<ClientReport />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="kbju" element={<Kbju />} />
          <Route path="food-calculator" element={<FoodCalculator />} />
          <Route path="my-cabinet" element={<MyCabinet />} />
          <Route path="recipes" element={<Recipes />} />
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
        <Route path="lifestyle" element={<PortalLifestyle />} />
        <Route path="recipes" element={<PortalRecipes />} />
        <Route path="chat" element={<Chat />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
