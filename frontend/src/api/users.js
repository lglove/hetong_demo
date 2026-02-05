import client from "./client";

export function listUsers() {
  return client.get("/users");
}

export function createUser(data) {
  return client.post("/users", data);
}

export function updateUser(id, data) {
  return client.put(`/users/${id}`, data);
}

export function deleteUser(id) {
  return client.delete(`/users/${id}`);
}
