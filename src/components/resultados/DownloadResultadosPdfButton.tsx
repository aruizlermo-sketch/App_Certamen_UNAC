"use client";

import { useState } from "react";
import type { ResultadosConcurso } from "@/types/certamen";

type DownloadResultadosPdfButtonProps = {
  resultados: ResultadosConcurso;
  label?: string;
};

export function DownloadResultadosPdfButton({
  resultados,
  label = "Descargar PDF",
}: DownloadResultadosPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const { downloadResultadosPdf } = await import("@/lib/certamen/resultados-pdf");
      downloadResultadosPdf(resultados);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? "Generando..." : label}
    </button>
  );
}
