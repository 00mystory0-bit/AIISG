export type Permission = "read" | "think" | "tool:execute" | "security:approve" | "memory:write";
export type Role = "owner" | "operator" | "observer";

const permissions: Record<Role, Permission[]> = {
  owner: ["read","think","tool:execute","security:approve","memory:write"],
  operator: ["read","think","tool:execute","memory:write"],
  observer: ["read","think"]
};

export function can(role: Role, permission: Permission) {
  return permissions[role].includes(permission);
}

export function assertPermission(role: Role, permission: Permission) {
  if (!can(role, permission)) throw new Error("Permission denied");
}
