import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Button, Space, Input, Select, DatePicker, Card, message, Popconfirm } from "antd";
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuth } from "../stores/auth";
import {
  listContracts,
  deleteContract,
} from "../api/contracts";
import dayjs from "dayjs";
import { toChineseAmount } from "../utils/amount";

const statusOptions = [
  { value: "draft", label: "草稿" },
  { value: "pending_finance", label: "待财务审批" },
  { value: "finance_approved", label: "待管理员审批" },
  { value: "active", label: "已生效" },
  { value: "rejected", label: "已驳回" },
  { value: "expired", label: "已到期" },
  { value: "terminated", label: "已终止" },
];

export default function ContractList() {
  const [data, setData] = useState({ total: 0, items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [signDateFrom, setSignDateFrom] = useState(null);
  const [signDateTo, setSignDateTo] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const canCreate = user?.role !== "finance";
  const canEditOrDelete = user?.role === "super_admin" || user?.role === "normal";

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
        keyword: keyword || undefined,
        status_filter: statusFilter,
        sign_date_from: signDateFrom ? signDateFrom.format("YYYY-MM-DD") : undefined,
        sign_date_to: signDateTo ? signDateTo.format("YYYY-MM-DD") : undefined,
      };
      const { data } = await listContracts(params);
      setData({ total: data.total, items: data.items });
    } catch (e) {
      message.error(e.response?.data?.detail || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, pageSize]);

  const onSearch = () => fetchList();

  const onDelete = async (id) => {
    try {
      await deleteContract(id);
      message.success("已删除");
      fetchList();
    } catch (e) {
      message.error(e.response?.data?.detail || "删除失败");
    }
  };

  const columns = [
    { title: "合同编号", dataIndex: "contract_no", key: "contract_no", width: 140 },
    { title: "合同名称", dataIndex: "title", key: "title", ellipsis: true },
    { title: "甲方", dataIndex: "party_a", key: "party_a", ellipsis: true },
    { title: "乙方", dataIndex: "party_b", key: "party_b", ellipsis: true },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      width: 200,
      render: (v) => {
        if (v == null) return "-";
        const chinese = toChineseAmount(v);
        return (
          <div>
            <div>¥ {Number(v).toLocaleString()}</div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: 2 }}>
              {chinese}
            </div>
          </div>
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (v) => statusOptions.find((o) => o.value === v)?.label ?? v,
    },
    {
      title: "操作",
      key: "action",
      width: 180,
      render: (_, row) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/contracts/${row.id}`)}>
            查看
          </Button>
          {canEditOrDelete && (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/contracts/${row.id}/edit`)}>
              编辑
            </Button>
          )}
          {canEditOrDelete && (
            <Popconfirm title="确定删除？" onConfirm={() => onDelete(row.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card title="合同列表">
      <Space wrap size="small" style={{ marginBottom: 16 }} className="contract-list-filters">
        <Input
          placeholder="关键词"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={onSearch}
          style={{ minWidth: 120, maxWidth: 200 }}
        />
        <Select
          placeholder="状态"
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          options={statusOptions}
        />
        <DatePicker placeholder="签订日期起" value={signDateFrom} onChange={setSignDateFrom} />
        <DatePicker placeholder="签订日期止" value={signDateTo} onChange={setSignDateTo} />
        <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
          查询
        </Button>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/contracts/new")}>
            新建合同
          </Button>
        )}
      </Space>
      <div className="contract-table-wrapper">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data.items}
        loading={loading}
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize,
          total: data.total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p, ps) => {
            setPage(p);
            if (ps) setPageSize(ps);
          },
        }}
      />
      </div>
    </Card>
  );
}
