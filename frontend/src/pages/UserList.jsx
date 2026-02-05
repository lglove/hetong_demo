import { useState, useEffect } from "react";
import { Table, Button, Space, Card, Modal, Form, Input, Select, message, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { listUsers, createUser, updateUser, deleteUser } from "../api/users";

const roleOptions = [
  { value: "super_admin", label: "超级管理员" },
  { value: "finance", label: "财务" },
  { value: "normal", label: "普通账号" },
];

export default function UserList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  const fetchList = async () => {
    setLoading(true);
    try {
      const { data } = await listUsers();
      setList(data);
    } catch (e) {
      message.error(e.response?.data?.detail || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      username: record.username,
      role: record.role,
    });
    setModalOpen(true);
  };

  const onModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await updateUser(editingId, { role: values.role, password: values.password || undefined });
        message.success("已更新");
      } else {
        await createUser({ username: values.username, password: values.password, role: values.role });
        message.success("已创建");
      }
      setModalOpen(false);
      fetchList();
    } catch (e) {
      if (e.errorFields) return;
      message.error(e.response?.data?.detail || "操作失败");
    }
  };

  const onDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success("已删除");
      fetchList();
    } catch (e) {
      message.error(e.response?.data?.detail || "删除失败");
    }
  };

  const columns = [
    { title: "用户名", dataIndex: "username", key: "username" },
    {
      title: "角色",
      dataIndex: "role",
      key: "role",
      render: (v) => roleOptions.find((o) => o.value === v)?.label ?? v,
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该用户？"
            onConfirm={() => onDelete(row.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="用户管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          新建用户
        </Button>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        loading={loading}
        pagination={false}
        scroll={{ x: 400 }}
      />
      <Modal
        title={editingId ? "编辑用户" : "新建用户"}
        open={modalOpen}
        onOk={onModalOk}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input disabled={!!editingId} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label={editingId ? "新密码（不填则不修改）" : "密码"}
            rules={editingId ? [] : [{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder={editingId ? "留空则不修改" : "密码"} />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select options={roleOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
