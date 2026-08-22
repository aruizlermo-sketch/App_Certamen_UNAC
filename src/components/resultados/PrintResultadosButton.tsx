"use client";

type PrintResultadosButtonProps = {
  label?: string;
};

export function PrintResultadosButton({
  label = "Imprimir PDF",
}: PrintResultadosButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-primary no-print"
    >
      {label}
    </button>
  );
}
