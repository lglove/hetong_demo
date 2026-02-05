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
  
  // 监听金额字段变化，用于实时显示中文大写金额
  const amount = Form.useWatch("amount", form);

  useEffect(() => {
    if (!isEdit) return;
    getContract(id)
      .then(({ data }) => {
        form.setFieldsValue({
          title: data.title,
          contract_no: data.contract_no,
          party_a: data.party_a,
          party_b: data.party_b,
          amount: data.amount,
          sign_date: data.sign_date ? dayjs(data.sign_date) : null,
          expire_date: data.expire_date ? dayjs(data.expire_date) : null,
          status: data.status,
          note: data.note,
        });
      })
      .catch(() => message.error("加载失败"))
      .finally(() => setLoadingDetail(false));
  }, [id, isEdit, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 构建 payload，确保所有字段都被正确处理
      const payload = {
        title: values.title,
        contract_no: values.contract_no,
        party_a: values.party_a,
        party_b: values.party_b,
        // 确保 amount 是数字类型，如果存在则转换
        amount: values.amount != null && values.amount !== "" ? Number(values.amount) : undefined,
        sign_date: values.sign_date ? values.sign_date.format("YYYY-MM-DD") : null,
        expire_date: values.expire_date ? values.expire_date.format("YYYY-MM-DD") : null,
        status: values.status,
        note: values.note,
      };
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

  return (
    <Card title={isEdit ? "编辑合同" : "新建合同"}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ status: "draft" }}
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
          <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          {amount != null && amount !== "" && (
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
