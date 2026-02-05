import client from "./client";

export function login(username, password) {
  return client.post("/auth/login", { username, password });
}

export function changePassword(currentPassword, newPassword) {
  return client.post("/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
}
