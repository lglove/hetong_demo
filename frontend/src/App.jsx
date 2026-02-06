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
import About from "./pages/About";

function Routes() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // 检测当前域名
  const hostname = window.location.hostname;
  const isAdminDomain = hostname === "admin.lige.website";
  const isWwwDomain = hostname === "www.lige.website" || hostname === "lige.website";

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      navigate("/login", { replace: true });
    });
  }, [logout, navigate]);

  const routes = useRoutes([
    { path: "/login", element: <Login /> },
    // 公开页面：不要求登录
    { path: "/about", element: <About /> },
    {
      path: "/",
      element: isWwwDomain ? (
        // www.lige.website 显示个人信息页
        <About />
      ) : (
        // admin.lige.website 或其他域名显示合同管理系统
        <RequireAuth>
          <Layout />
        </RequireAuth>
      ),
      children: isWwwDomain ? [] : [
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
