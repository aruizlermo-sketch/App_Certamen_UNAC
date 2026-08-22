"use client";

import { useState } from "react";
import { downloadResultadosPdf } from "@/lib/certamen/resultados-pdf";
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

  function handleDownload() {
    setLoading(true);
    try {
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
