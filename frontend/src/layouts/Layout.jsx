import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { Button, Modal, Form, Input, message, Drawer } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useAuth } from "../stores/auth";
import { changePassword } from "../api/auth";
import "./Layout.css";

export default function Layout() {
  const { user, logout, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pwdForm] = Form.useForm();
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    document.title = "个人管理系统";
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  // 检测是否为 admin 域名
  const isAdminDomain = window.location.hostname === "admin.lige.website";
  
  const navLinks = (
    <>
      <Link to="/contracts" onClick={() => setMobileMenuOpen(false)}>合同</Link>
      {isSuperAdmin && <Link to="/users" onClick={() => setMobileMenuOpen(false)}>用户管理</Link>}
      {isSuperAdmin && <Link to="/operations" onClick={() => setMobileMenuOpen(false)}>操作日志</Link>}
      {!isAdminDomain && <Link to="/about" onClick={() => setMobileMenuOpen(false)}>关于我</Link>}
    </>
  );

  const handleChangePassword = async () => {
    try {
      const values = await pwdForm.validateFields();
      if (values.new_password !== values.new_password_confirm) {
        message.error("两次输入的新密码不一致");
        return;
      }
      setPwdLoading(true);
      await changePassword(values.current_password, values.new_password);
      message.success("密码已修改，请重新登录");
      setPwdModalOpen(false);
      pwdForm.resetFields();
      logout();
      navigate("/login");
    } catch (e) {
      if (e.errorFields) return;
      message.error(e.response?.data?.detail || "修改失败");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-inner">
          <Button
            type="text"
            className="app-menu-btn"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="菜单"
          />
          <Link to="/contracts" className="app-brand">合同管理系统</Link>
          <nav className="app-nav">{navLinks}</nav>
          <div className="app-user">
            <span className="app-username">{user?.username}</span>
            <Button type="link" size="small" onClick={() => setPwdModalOpen(true)}>
              修改密码
            </Button>
            <Button type="link" size="small" onClick={handleLogout}>
              退出
            </Button>
          </div>
        </div>
      </header>
      <Drawer
        title="菜单"
        placement="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        className="app-drawer"
      >
        <nav className="app-drawer-nav">{navLinks}</nav>
        <div className="app-drawer-user">
          <span>{user?.username}</span>
          <Button block onClick={() => { setPwdModalOpen(true); setMobileMenuOpen(false); }}>修改密码</Button>
          <Button block onClick={handleLogout}>退出</Button>
        </div>
      </Drawer>
      <main className="app-main">
        <Outlet />
      </main>
      <Modal
        title="修改密码"
        open={pwdModalOpen}
        onOk={handleChangePassword}
        onCancel={() => { setPwdModalOpen(false); pwdForm.resetFields(); }}
        confirmLoading={pwdLoading}
        destroyOnClose
      >
        <Form form={pwdForm} layout="vertical">
          <Form.Item
            name="current_password"
            label="当前密码"
            rules={[{ required: true, message: "请输入当前密码" }]}
          >
            <Input.Password placeholder="当前密码" />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="新密码"
            rules={[{ required: true, message: "请输入新密码" }, { min: 6, message: "至少 6 位" }]}
          >
            <Input.Password placeholder="新密码" />
          </Form.Item>
          <Form.Item
            name="new_password_confirm"
            label="确认新密码"
            rules={[{ required: true, message: "请再次输入新密码" }]}
          >
            <Input.Password placeholder="确认新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
