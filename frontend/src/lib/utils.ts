import api from "./api";

export const getImageUrl = (src?: string) => {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const base = api.defaults.baseURL || "";
  const origin = base.replace(/\/api\/?$/, "");
  if (src.startsWith("/uploads/")) return origin ? `${origin}${src}` : src;
  return src;
};

export const ADMIN_ROLES = ["superadmin", "admin", "manager"];
export const isAdminRole = (role?: string) => !!role && ADMIN_ROLES.includes(role);
export const homeForRole = (role?: string) => (isAdminRole(role) ? "/admin/" : "/staff/");
