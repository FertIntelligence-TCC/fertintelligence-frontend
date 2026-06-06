import { User } from "@/interfaces/Models";

export const isSupremeUser = (user?: User): boolean => {
  const values = [user?.cargo, user?.login, user?.name, user?.email]
    .filter(Boolean)
    .map((value) => String(value).toUpperCase());

  return values.some((value) =>
    ["SUPREMO", "USUARIO_SUPREMO", "SUPREME", "ROOT"].includes(value)
  );
};
