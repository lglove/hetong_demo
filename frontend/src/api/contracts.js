import client from "./client";

export function listContracts(params) {
  return client.get("/contracts", { params });
}

export function getContract(id) {
  return client.get(`/contracts/${id}`);
}

export function createContract(data) {
  return client.post("/contracts", data);
}

export function updateContract(id, data) {
  return client.put(`/contracts/${id}`, data);
}

export function deleteContract(id) {
  return client.delete(`/contracts/${id}`);
}

export function submitContract(id) {
  return client.post(`/contracts/${id}/submit`);
}

export function withdrawByCreator(id) {
  return client.post(`/contracts/${id}/withdraw-by-creator`);
}

export function withdrawByFinance(id) {
  return client.post(`/contracts/${id}/withdraw-by-finance`);
}

export function approveFinance(id, remark) {
  return client.post(`/contracts/${id}/approve-finance`, { remark: remark || null });
}

export function rejectFinance(id, remark) {
  return client.post(`/contracts/${id}/reject-finance`, { remark: remark || null });
}

export function approveAdmin(id, remark) {
  return client.post(`/contracts/${id}/approve-admin`, { remark: remark || null });
}

export function rejectAdmin(id, remark) {
  return client.post(`/contracts/${id}/reject-admin`, { remark: remark || null });
}

export function getContractOperations(contractId) {
  return client.get(`/contracts/${contractId}/operations`);
}

export function exportContractPdf(contractId) {
  return client.get(`/contracts/${contractId}/pdf`, { responseType: "blob" });
}

export function uploadAttachment(contractId, file) {
  const form = new FormData();
  form.append("file", file);
  return client.post(`/contracts/${contractId}/attachments`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function getAttachmentDownloadUrl(contractId, attachmentId) {
  return `/api/contracts/${contractId}/attachments/${attachmentId}`;
}
