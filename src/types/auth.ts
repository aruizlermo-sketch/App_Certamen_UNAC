import type { UserRol } from "@/types/certamen";

export type AppSession = {
  userId: string | null;
  email: string | null;
  rol: UserRol;
  juradoId: string | null;
  juradoNombre: string | null;
  esPresidente: boolean;
  isDemo: boolean;
};
