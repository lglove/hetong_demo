import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Form, Input, InputNumber, Select, DatePicker, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getContract, createContract, updateContract, uploadAttachment } from "../api/contracts";
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

export default function ContractForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(isEdit);
  const [fileList, setFileList] = useState([]);
  const [loadedData, setLoadedData] = useState(null);
  
  // 监听金额字段变化，用于实时显示中文大写金额
  const amount = Form.useWatch("amount", form);

  useEffect(() => {
    if (!isEdit) {
      setLoadedData(null);
      setLoadingDetail(false);
      // 重置表单为初始状态
      form.resetFields();
      form.setFieldsValue({ status: "draft" });
      return;
    }
    setLoadingDetail(true);
    setLoadedData(null);
    getContract(id)
      .then(({ data }) => {
        const rawAmount = data.amount;
        let amountNum =
          rawAmount != null && rawAmount !== ""
            ? (typeof rawAmount === "number" ? rawAmount : parseFloat(String(rawAmount)))
            : undefined;
        if (amountNum != null && isNaN(amountNum)) amountNum = undefined;
        const values = {
          title: data.title,
          contract_no: data.contract_no,
          party_a: data.party_a,
          party_b: data.party_b,
          amount: amountNum,
          sign_date: data.sign_date ? dayjs(data.sign_date) : null,
          expire_date: data.expire_date ? dayjs(data.expire_date) : null,
          status: data.status,
          note: data.note,
        };
        setLoadedData(values);
        // 使用 setFieldsValue 显式更新表单值，确保金额正确显示
        form.setFieldsValue(values);
        setLoadingDetail(false);
      })
      .catch(() => {
        message.error("加载失败");
        setLoadingDetail(false);
      });
  }, [id, isEdit, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 编辑时优先从表单取金额，确保拿到当前输入值（避免 InputNumber 未同步到 values）
      const amountRaw = isEdit
        ? (form.getFieldValue("amount") ?? values.amount)
        : values.amount;
      const amountVal = amountRaw != null && amountRaw !== "" ? Number(amountRaw) : null;
      if (amountVal !== null && isNaN(amountVal)) {
        message.error("金额格式不正确");
        setLoading(false);
        return;
      }
      if (!isEdit && amountVal == null) {
        message.error("请填写金额");
        setLoading(false);
        return;
      }

      const payload = {
        title: values.title,
        contract_no: values.contract_no,
        party_a: values.party_a,
        party_b: values.party_b,
        sign_date: values.sign_date ? values.sign_date.format("YYYY-MM-DD") : null,
        expire_date: values.expire_date ? values.expire_date.format("YYYY-MM-DD") : null,
        status: values.status,
        note: values.note ?? null,
      };
      // 金额：创建必填，编辑时始终提交以便后端正确更新
      if (amountVal != null) {
        payload.amount = amountVal;
      }
      if (isEdit) {
        await updateContract(id, payload);
        message.success("已保存");
        if (fileList.length > 0) {
          for (const file of fileList) {
            if (file.originFileObj) {
              await uploadAttachment(id, file.originFileObj);
            }
          }
        }
        navigate(`/contracts/${id}`);
      } else {
        const { data } = await createContract(payload);
        message.success("已创建");
        const cid = data.id;
        if (fileList.length > 0) {
          for (const file of fileList) {
            if (file.originFileObj) {
              await uploadAttachment(cid, file.originFileObj);
            }
          }
        }
        navigate(`/contracts/${cid}`);
      }
    } catch (e) {
      message.error(e.response?.data?.detail || "保存失败");
    } finally {
      setLoading(false);
    }
  };

  // 编辑模式下，如果还在加载数据，显示加载状态
  if (isEdit && loadingDetail && !loadedData) {
    return <Card title="编辑合同" loading>加载中...</Card>;
  }

  return (
    <Card title={isEdit ? "编辑合同" : "新建合同"}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={loadedData || { status: "draft" }}
        key={id || "new"}
        disabled={loadingDetail}
      >
        <Form.Item name="title" label="合同名称" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="contract_no" label="合同编号" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="party_a" label="甲方" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="party_b" label="乙方" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="amount" label="金额" rules={[{ required: true }]}>
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: "100%" }}
            onChange={(value) => {
              // 确保表单值同步更新，Form.useWatch 会自动触发大写金额更新
              form.setFieldsValue({ amount: value ?? null });
            }}
          />
          {amount != null && amount !== "" && !isNaN(Number(amount)) && (
            <div style={{ marginTop: 8, color: "#666", fontSize: "14px" }}>
              大写：{toChineseAmount(amount)}
            </div>
          )}
        </Form.Item>
        <Form.Item name="sign_date" label="签订日期">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="expire_date" label="到期日">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select options={statusOptions} />
        </Form.Item>
        <Form.Item name="note" label="备注">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label="上传附件">
          <Upload
            multiple
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList: fl }) => setFileList(fl)}
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? "保存" : "创建"}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
