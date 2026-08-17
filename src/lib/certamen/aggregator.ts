import type {
  Calificacion,
  Categoria,
  CategoriaCriterio,
  Concurso,
  ConcursoCompleto,
  Jurado,
  Participante,
  PuntajeParticipanteCategoria,
  PuntajeTotalParticipante,
  RankingCategoria,
  ResultadosConcurso,
} from "@/types/certamen";

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function round2(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function calcularPuntajeCategoria(
  participanteId: string,
  participanteNombre: string,
  categoria: Categoria,
  criterios: CategoriaCriterio[],
  juradoIds: string[],
  calificaciones: Calificacion[],
): PuntajeParticipanteCategoria {
  const criteriosCat = criterios
    .filter((c) => c.categoriaId === categoria.id)
    .sort((a, b) => a.orden - b.orden);

  const desglose = criteriosCat.map((crit) => {
    const notas = calificaciones
      .filter(
        (cal) =>
          cal.participanteId === participanteId &&
          cal.categoriaCriterioId === crit.id &&
          juradoIds.includes(cal.juradoId),
      )
      .map((cal) => cal.puntaje);

    const promedio = avg(notas);
    const contribucion = promedio * crit.peso;

    return {
      criterioId: crit.id,
      criterioNombre: crit.nombre,
      promedio: round2(promedio),
      peso: crit.peso,
      contribucion: round2(contribucion),
    };
  });

  const puntaje = round2(desglose.reduce((sum, d) => sum + d.contribucion, 0));

  return {
    participanteId,
    participanteNombre,
    puntaje,
    desglose,
  };
}

export function calcularRankingCategoria(
  categoria: Categoria,
  criterios: CategoriaCriterio[],
  participantes: Participante[],
  juradoIds: string[],
  calificaciones: Calificacion[],
): RankingCategoria {
  const ranking = participantes
    .map((p) =>
      calcularPuntajeCategoria(
        p.id,
        p.nombre,
        categoria,
        criterios,
        juradoIds,
        calificaciones,
      ),
    )
    .sort((a, b) => b.puntaje - a.puntaje);

  return {
    categoria,
    ranking,
    ganador: ranking[0] ?? null,
  };
}

export function calcularPuntajeTotal(
  participante: Participante,
  categorias: Categoria[],
  criterios: CategoriaCriterio[],
  juradoCategorias: { juradoId: string; categoriaId: string }[],
  calificaciones: Calificacion[],
): PuntajeTotalParticipante {
  const porCategoria = categorias.map((cat) => {
    const juradoIds = juradoCategorias
      .filter((jc) => jc.categoriaId === cat.id)
      .map((jc) => jc.juradoId);

    const puntaje = calcularPuntajeCategoria(
      participante.id,
      participante.nombre,
      cat,
      criterios,
      juradoIds,
      calificaciones,
    ).puntaje;

    return {
      categoriaId: cat.id,
      categoriaNombre: cat.nombre,
      puntaje,
      peso: cat.pesoTotal,
      contribucion: round2(puntaje * cat.pesoTotal),
    };
  });

  const puntajeTotal = round2(
    porCategoria.reduce((sum, c) => sum + c.contribucion, 0),
  );

  return {
    participanteId: participante.id,
    participanteNombre: participante.nombre,
    puntajeTotal,
    porCategoria,
  };
}

export function calcularResultados(
  concurso: Concurso,
  categorias: Categoria[],
  criterios: CategoriaCriterio[],
  participantes: Participante[],
  juradoCategorias: { juradoId: string; categoriaId: string }[],
  calificaciones: Calificacion[],
): ResultadosConcurso {
  const porCategoria = categorias
    .sort((a, b) => a.orden - b.orden)
    .map((cat) => {
      const juradoIds = juradoCategorias
        .filter((jc) => jc.categoriaId === cat.id)
        .map((jc) => jc.juradoId);

      return calcularRankingCategoria(
        cat,
        criterios,
        participantes,
        juradoIds,
        calificaciones,
      );
    });

  const rankingGeneral = participantes
    .map((p) =>
      calcularPuntajeTotal(
        p,
        categorias,
        criterios,
        juradoCategorias,
        calificaciones,
      ),
    )
    .sort((a, b) => b.puntajeTotal - a.puntajeTotal);

  return {
    concurso,
    rankingGeneral,
    porCategoria,
  };
}

export function buildConcursoCompleto(
  concurso: Concurso,
  categorias: Categoria[],
  criterios: CategoriaCriterio[],
  participantes: Participante[],
  jurados: Jurado[],
  juradoCategorias: { juradoId: string; categoriaId: string }[],
): ConcursoCompleto {
  return {
    ...concurso,
    participantes: participantes.sort((a, b) => a.orden - b.orden),
    jurados,
    categorias: categorias
      .sort((a, b) => a.orden - b.orden)
      .map((cat) => ({
        ...cat,
        criterios: criterios
          .filter((c) => c.categoriaId === cat.id)
          .sort((a, b) => a.orden - b.orden),
        jurados: juradoCategorias
          .filter((jc) => jc.categoriaId === cat.id)
          .map((jc) => jurados.find((j) => j.id === jc.juradoId))
          .filter((j): j is Jurado => Boolean(j)),
      })),
  };
}
