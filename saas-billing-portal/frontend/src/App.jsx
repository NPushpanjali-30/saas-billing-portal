import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="content">
        {children}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const isLoggedIn =
    localStorage.getItem("loggedIn");

  return isLoggedIn ? (
    children
  ) : (
    <Navigate to="/login" />
  );
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Layout>
                <Billing />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/login" />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;