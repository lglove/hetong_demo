import client from "./client";

export function listOperations(params) {
  return client.get("/operations", { params });
}
