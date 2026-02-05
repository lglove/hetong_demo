import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, Card, message } from "antd";
import { useAuth } from "../stores/auth";
import { login } from "../api/auth";
import "./Login.css";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/contracts";

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { data } = await login(values.username, values.password);
      setAuth(data.access_token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      message.error(err.response?.data?.detail || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card" title="登录">
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
