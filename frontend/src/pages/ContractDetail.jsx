import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Button, Space, message, Modal, Input, Timeline } from "antd";
import { EditOutlined, DownloadOutlined, SendOutlined, CheckOutlined, CloseOutlined, LeftOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useAuth } from "../stores/auth";
import {
  getContract,
  getContractOperations,
  submitContract,
  withdrawByCreator,
  withdrawByFinance,
  approveFinance,
  rejectFinance,
  approveAdmin,
  rejectAdmin,
  exportContractPdf,
} from "../api/contracts";
import client from "../api/client";
import dayjs from "dayjs";
import { toChineseAmount } from "../utils/amount";

const statusMap = {
  draft: "草稿",
  pending_finance: "待财务审批",
  finance_approved: "待管理员审批",
  active: "已生效",
  rejected: "已驳回",
  expired: "已到期",
  terminated: "已终止",
};

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

function downloadFile(contractId, attachmentId, fileName) {
  const url = `/contracts/${contractId}/attachments/${attachmentId}`;
  client
    .get(url, { responseType: "blob" })
    .then((res) => {
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    })
    .catch((err) => {
      const msg = err.response?.data instanceof Blob
        ? "无权限或文件不存在"
        : (err.response?.data?.detail || "下载失败");
      message.error(msg);
    });
}

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, type: null });
  const [rejectRemark, setRejectRemark] = useState("");

  const isCreator = contract && String(contract.created_by) === String(user?.id);
  const canEdit =
    (user?.role === "super_admin" || (isCreator && (contract?.status === "draft" || contract?.status === "rejected")));
  const canSubmit = isCreator && contract?.status === "draft";
  const canWithdrawByCreator = isCreator && contract?.status === "pending_finance";
  const canFinanceApprove = (user?.role === "finance" || user?.role === "super_admin") && contract?.status === "pending_finance";
  const canWithdrawByFinance = (user?.role === "finance" || user?.role === "super_admin") && contract?.status === "finance_approved";
  const canAdminApprove = user?.role === "super_admin" && contract?.status === "finance_approved";

  const handleExportPdf = () => {
    exportContractPdf(id)
      .then((res) => {
        const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `合同_${contract?.contract_no || id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        message.success("已导出 PDF");
      })
      .catch((e) => {
        const msg = e.response?.data instanceof Blob ? "无权限或导出失败" : (e.response?.data?.detail || "导出失败");
        message.error(msg);
      });
  };

  const refresh = () => {
    getContract(id).then(({ data }) => setContract(data));
    getContractOperations(id).then(({ data }) => setOperations(data)).catch(() => setOperations([]));
  };

  useEffect(() => {
    let cancelled = false;
    getContract(id)
      .then(({ data }) => { if (!cancelled) setContract(data); })
      .catch((e) => { if (!cancelled) message.error(e.response?.data?.detail || "加载失败"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    getContractOperations(id).then(({ data }) => { if (!cancelled) setOperations(data); }).catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  const doSubmit = async () => {
    setActionLoading(true);
    try {
      await submitContract(id);
      message.success("已提交审批");
      refresh();
    } catch (e) {
      message.error(e.response?.data?.detail || "操作失败");
    } finally {
      setActionLoading(false);
    }
  };

  const doWithdrawByCreator = async () => {
    setActionLoading(true);
    try {
      await withdrawByCreator(id);
      message.success("已撤回，恢复为草稿");
      refresh();
    } catch (e) {
      message.error(e.response?.data?.detail || "操作失败");
    } finally {
      setActionLoading(false);
    }
  };

  const doWithdrawByFinance = async () => {
    setActionLoading(true);
    try {
      await withdrawByFinance(id);
      message.success("已撤回，恢复为待财务审批");
      refresh();
    } catch (e) {
      message.error(e.response?.data?.detail || "操作失败");
    } finally {
      setActionLoading(false);
    }
  };

  const doApprove = async (fn, type) => {
    setActionLoading(true);
    try {
      await fn(id);
      message.success(type === "finance" ? "财务已审批通过" : "已审批通过");
      setRejectModal({ open: false, type: null });
      refresh();
    } catch (e) {
      message.error(e.response?.data?.detail || "操作失败");
    } finally {
      setActionLoading(false);
    }
  };

  const doReject = async () => {
    const fn = rejectModal.type === "finance" ? rejectFinance : rejectAdmin;
    setActionLoading(true);
    try {
      await fn(id, rejectRemark || undefined);
      message.success("已驳回");
      setRejectModal({ open: false, type: null });
      setRejectRemark("");
      refresh();
    } catch (e) {
      message.error(e.response?.data?.detail || "操作失败");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !contract) {
    return <Card loading={loading}>加载中...</Card>;
  }

  return (
    <Card
      title="合同详情"
      className="contract-detail-card"
      extra={
        <Space wrap size="small" className="contract-detail-actions">
          <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
          <Button icon={<FilePdfOutlined />} onClick={handleExportPdf}>导出 PDF</Button>
          {canEdit && (
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/contracts/${id}/edit`)}>
              编辑
            </Button>
          )}
          {canSubmit && (
            <Button icon={<SendOutlined />} onClick={doSubmit} loading={actionLoading}>
              提交审批
            </Button>
          )}
          {canWithdrawByCreator && (
            <Button onClick={doWithdrawByCreator} loading={actionLoading}>
              撤回
            </Button>
          )}
          {canFinanceApprove && (
            <>
              <Button type="primary" icon={<CheckOutlined />} onClick={() => doApprove(approveFinance, "finance")} loading={actionLoading}>
                审批通过
              </Button>
              <Button danger icon={<CloseOutlined />} onClick={() => setRejectModal({ open: true, type: "finance" })}>
                驳回
              </Button>
            </>
          )}
          {canWithdrawByFinance && (
            <Button onClick={doWithdrawByFinance} loading={actionLoading}>
              撤回
            </Button>
          )}
          {canAdminApprove && (
            <>
              <Button type="primary" icon={<CheckOutlined />} onClick={() => doApprove(approveAdmin, "admin")} loading={actionLoading}>
                审批通过
              </Button>
              <Button danger icon={<CloseOutlined />} onClick={() => setRejectModal({ open: true, type: "admin" })}>
                驳回
              </Button>
            </>
          )}
        </Space>
      }
    >
      <Descriptions column={{ xs: 1, sm: 1, md: 1 }} bordered size="small">
        <Descriptions.Item label="合同名称">{contract.title}</Descriptions.Item>
        <Descriptions.Item label="合同编号">{contract.contract_no}</Descriptions.Item>
        <Descriptions.Item label="甲方">{contract.party_a}</Descriptions.Item>
        <Descriptions.Item label="乙方">{contract.party_b}</Descriptions.Item>
        <Descriptions.Item label="金额">
          ¥ {contract.amount != null ? Number(contract.amount).toLocaleString() : "-"}
          {contract.amount != null && (
            <span style={{ marginLeft: 12, color: "#666" }}>
              （{toChineseAmount(contract.amount)}）
            </span>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="签订日期">{contract.sign_date || "-"}</Descriptions.Item>
        <Descriptions.Item label="到期日">{contract.expire_date || "-"}</Descriptions.Item>
        <Descriptions.Item label="状态">{statusMap[contract.status] ?? contract.status}</Descriptions.Item>
        <Descriptions.Item label="创建人">{contract.created_by_username || "-"}</Descriptions.Item>
        <Descriptions.Item label="备注">{contract.note || "-"}</Descriptions.Item>
      </Descriptions>
      {contract.attachments?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4>附件</h4>
          <Space direction="vertical">
            {contract.attachments.map((a) => (
              <Button
                key={a.id}
                icon={<DownloadOutlined />}
                onClick={() => downloadFile(contract.id, a.id, a.file_name)}
              >
                {a.file_name} ({(a.file_size / 1024).toFixed(1)} KB)
              </Button>
            ))}
          </Space>
        </div>
      )}
      {operations.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h4>操作记录</h4>
          <Timeline
            items={operations.map((op) => {
              const statusText = (op.from_status || op.to_status)
                ? `（${(statusMap[op.from_status] ?? op.from_status) || "-"} → ${(statusMap[op.to_status] ?? op.to_status) || "-"}）`
                : "";
              return {
                children: (
                  <div>
                    <strong>{actionMap[op.action] ?? op.action}</strong>
                    {statusText}{" — "}{op.username} · {dayjs(op.created_at).format("YYYY-MM-DD HH:mm")}
                    {op.remark && <div style={{ color: "#666" }}>备注: {op.remark}</div>}
                  </div>
                ),
              };
            })}
          />
        </div>
      )}
      <Modal
        title="驳回理由"
        open={rejectModal.open}
        onOk={doReject}
        onCancel={() => { setRejectModal({ open: false, type: null }); setRejectRemark(""); }}
        confirmLoading={actionLoading}
      >
        <Input.TextArea rows={3} placeholder="选填" value={rejectRemark} onChange={(e) => setRejectRemark(e.target.value)} />
      </Modal>
    </Card>
  );
}
