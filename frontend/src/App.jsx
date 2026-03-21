import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./shared/components/ProtectedRoutes";
import AppLayout from "./layouts/AppLayout";

import Landing from "./features/auth/pages/Landing";
import Login from "./features/auth/pages/Login";
import Signup from "./features/auth/pages/Signup";
import Dashboard from "./features/dashboard/pages/Dashboard";
import NewRecording from "./features/recording/pages/NewRecording";
import Results from "./features/sessions/pages/Results";
import Library from "./features/library/pages/Library";
import Flashcards from "./features/flashcards/pages/Flashcards";
import Chat from "./features/chat/pages/Chat";
import Insights from "./features/insights/pages/Insights";
import Settings from "./features/settings/pages/Settings";
import NotFound from "./shared/components/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/record" element={<NewRecording />} />
            <Route path="/sessions/:id" element={<Results />} />
            <Route path="/library" element={<Library />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
