import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ResultadosConcurso } from "@/types/certamen";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function downloadResultadosPdf(resultados: ResultadosConcurso) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const { concurso, rankingGeneral, porCategoria } = resultados;
  const navy = [7, 41, 77] as [number, number, number];
  const fecha = new Date().toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Universidad Nacional del Callao", 14, 14);
  doc.setFontSize(15);
  doc.text(concurso.nombre, 14, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Acta de resultados — ${fecha}`, 14, 29);

  const categoriaHeaders = porCategoria.map((rc) =>
    rc.categoria.nombre.replace(/^Mejor\s+/i, ""),
  );

  autoTable(doc, {
    startY: 34,
    head: [["N°", "Tuna", "Puntaje total", ...categoriaHeaders]],
    body: rankingGeneral.map((r, index) => [
      String(index + 1),
      r.participanteNombre,
      r.puntajeTotal.toFixed(3),
      ...r.porCategoria.map((pc) => pc.puntaje.toFixed(3)),
    ]),
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: navy, textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 10 },
      2: { halign: "right" },
    },
  });

  let cursorY = doc.lastAutoTable.finalY + 8;

  for (const rc of porCategoria) {
    if (cursorY > 185) {
      doc.addPage();
      cursorY = 14;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(rc.categoria.nombre, 14, cursorY);
    cursorY += 5;

    if (rc.ganador) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(
        `Ganador: ${rc.ganador.participanteNombre} (${rc.ganador.puntaje.toFixed(3)})`,
        14,
        cursorY,
      );
      cursorY += 5;
    }

    autoTable(doc, {
      startY: cursorY,
      head: [["N°", "Tuna", "Puntaje"]],
      body: rc.ranking.map((r, index) => [
        String(index + 1),
        r.participanteNombre,
        r.puntaje.toFixed(3),
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: navy, textColor: 255, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 10 },
        2: { halign: "right" },
      },
    });

    cursorY = doc.lastAutoTable.finalY + 8;
  }

  const filename = `resultados-${slugify(concurso.nombre) || "certamen"}.pdf`;
  doc.save(filename);
}
