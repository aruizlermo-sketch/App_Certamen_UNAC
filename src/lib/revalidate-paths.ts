import { revalidatePath } from "next/cache";

export function revalidateCertamenPaths() {
  revalidatePath("/");
  revalidatePath("/jurado");
  revalidatePath("/resultados");
  revalidatePath("/resultados/notas");
}

export function revalidateAdminPaths() {
  revalidateCertamenPaths();
  revalidatePath("/admin");
  revalidatePath("/admin/participantes");
  revalidatePath("/admin/jurados");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/usuarios");
}
