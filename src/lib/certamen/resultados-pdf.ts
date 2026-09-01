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

function formatPuntaje(value: number) {
  return value.toFixed(3);
}

export function downloadResultadosPdf(resultados: ResultadosConcurso) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const { concurso, rankingGeneral, porCategoria } = resultados;
  const premiosIndividuales = porCategoria.filter((rc) => rc.categoria.tienePremio);
  const navy = [7, 41, 77] as [number, number, number];
  const gold = [255, 198, 0] as [number, number, number];
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

  const primera = rankingGeneral[0];
  const segunda = rankingGeneral[1];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Primera mejor tuna", 14, 38);
  doc.setFont("helvetica", "normal");
  doc.text(
    primera && primera.puntajeTotal > 0
      ? `${primera.participanteNombre} — ${formatPuntaje(primera.puntajeTotal)}`
      : "Por definir",
    14,
    44,
  );

  doc.setFont("helvetica", "bold");
  doc.text("Segunda mejor tuna", 120, 38);
  doc.setFont("helvetica", "normal");
  doc.text(
    segunda && segunda.puntajeTotal > 0
      ? `${segunda.participanteNombre} — ${formatPuntaje(segunda.puntajeTotal)}`
      : "Por definir",
    120,
    44,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Tabla general — Puntaje total", 14, 54);

  autoTable(doc, {
    startY: 58,
    head: [["N°", "Tuna", "Puntaje total"]],
    body: rankingGeneral.map((r, index) => [
      String(index + 1),
      r.participanteNombre,
      formatPuntaje(r.puntajeTotal),
    ]),
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: navy, textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 12 },
      2: { halign: "right", cellWidth: 28 },
    },
    didParseCell(data) {
      if (data.section === "body" && data.row.index === 0) {
        data.cell.styles.fillColor = gold;
        data.cell.styles.textColor = navy;
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.row.index === 1) {
        data.cell.styles.fillColor = [232, 240, 250];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  let cursorY = doc.lastAutoTable.finalY + 10;

  if (premiosIndividuales.length > 0) {
    if (cursorY > 170) {
      doc.addPage();
      cursorY = 14;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Premios individuales por categoria", 14, cursorY);
    cursorY += 6;

    autoTable(doc, {
      startY: cursorY,
      head: [["Categoria", "Ganador/a", "Puntaje"]],
      body: premiosIndividuales.map((rc) => [
        rc.categoria.nombre,
        rc.ganador?.participanteNombre ?? "Por definir",
        rc.ganador ? formatPuntaje(rc.ganador.puntaje) : "—",
      ]),
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 2.5 },
      headStyles: { fillColor: navy, textColor: 255, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 70 },
        2: { halign: "right", cellWidth: 24 },
      },
    });
  }

  const filename = `resultados-${slugify(concurso.nombre) || "certamen"}.pdf`;
  doc.save(filename);
}
