import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Card, Select, Input, Button, Space, message } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useAuth } from "../stores/auth";
import { listOperations } from "../api/operations";
import { listContracts } from "../api/contracts";
import { listUsers } from "../api/users";
import dayjs from "dayjs";

const actionMap = {
  create: "创建合同",
  submit: "提交审批",
  withdraw_creator: "创建人撤回",
  withdraw_finance: "财务撤回",
  approve_finance: "财务审批通过",
  reject_finance: "财务驳回",
  approve_admin: "管理员审批通过",
  reject_admin: "管理员驳回",
  edit: "编辑",
};

const statusMap = {
  draft: "草稿",
  pending_finance: "待财务审批",
  finance_approved: "待管理员审批",
  active: "已生效",
  rejected: "已驳回",
  expired: "已到期",
  terminated: "已终止",
};

const formatStatus = (s) => (s ? (statusMap[s] ?? s) : "-");

export default function Operations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(false);
  const [contractId, setContractId] = useState(undefined);
  const [userId, setUserId] = useState(undefined);
  const [contracts, setContracts] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchOps = () => {
    setLoading(true);
    const params = { skip: 0, limit: 100 };
    if (contractId != null && contractId !== "") params.contract_id = contractId;
    if (userId != null && userId !== "") params.user_id = userId;
    listOperations(params)
      .then(({ data }) => setData({ total: data.total, items: data.items }))
      .catch((e) => message.error(e.response?.data?.detail || "加载失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role !== "super_admin") return;
    listContracts({ limit: 500 }).then((r) => setContracts(r.data.items || []));
    listUsers().then((r) => setUsers(r.data || []));
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "super_admin") fetchOps();
  }, [contractId, userId]);

  const columns = [
    { title: "时间", dataIndex: "created_at", key: "created_at", width: 170, render: (t) => dayjs(t).format("YYYY-MM-DD HH:mm:ss") },
    { title: "操作人", dataIndex: "username", key: "username", width: 120 },
    { title: "操作", dataIndex: "action", key: "action", width: 140, render: (a) => actionMap[a] ?? a },
    { title: "合同编号", dataIndex: "contract_no", key: "contract_no", width: 160, ellipsis: true, render: (v) => v ?? "-" },
    { title: "状态变更", key: "status", render: (_, r) => (r.from_status || r.to_status ? `${formatStatus(r.from_status)} → ${formatStatus(r.to_status)}` : "-") },
    { title: "备注", dataIndex: "remark", key: "remark", ellipsis: true },
  ];

  return (
    <Card
      title="操作日志"
      extra={
        <Space wrap size="small">
          <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
          <Select
            placeholder="按合同"
            allowClear
            style={{ minWidth: 160, maxWidth: 280 }}
            value={contractId}
            onChange={setContractId}
            showSearch
            optionFilterProp="label"
            options={contracts.map((c) => ({ value: c.id, label: `${c.contract_no} ${c.title}` }))}
          />
          <Select
            placeholder="按用户"
            allowClear
            style={{ width: 120, minWidth: 100 }}
            value={userId}
            onChange={setUserId}
            options={users.map((u) => ({ value: u.id, label: u.username }))}
          />
          <Button type="primary" onClick={fetchOps}>查询</Button>
        </Space>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data.items}
        loading={loading}
        scroll={{ x: 700 }}
        pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
      />
    </Card>
  );
}
