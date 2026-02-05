import { useNavigate, useRoutes, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./stores/auth";
import { setUnauthorizedHandler } from "./api/client";
import { RequireAuth, RequireSuperAdmin } from "./router";
import Layout from "./layouts/Layout";
import Login from "./pages/Login";
import ContractList from "./pages/ContractList";
import ContractDetail from "./pages/ContractDetail";
import ContractForm from "./pages/ContractForm";
import UserList from "./pages/UserList";
import Operations from "./pages/Operations";

function Routes() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      navigate("/login", { replace: true });
    });
  }, [logout, navigate]);

  const routes = useRoutes([
    { path: "/login", element: <Login /> },
    {
      path: "/",
      element: (
        <RequireAuth>
          <Layout />
        </RequireAuth>
      ),
      children: [
        { index: true, element: <Navigate to="/contracts" replace /> },
        { path: "contracts", element: <ContractList /> },
        { path: "contracts/new", element: <ContractForm /> },
        { path: "contracts/:id", element: <ContractDetail /> },
        { path: "contracts/:id/edit", element: <ContractForm /> },
        {
          path: "users",
          element: (
            <RequireSuperAdmin>
              <UserList />
            </RequireSuperAdmin>
          ),
        },
        {
          path: "operations",
          element: (
            <RequireSuperAdmin>
              <Operations />
            </RequireSuperAdmin>
          ),
        },
      ],
    },
  ]);

  return routes;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}
