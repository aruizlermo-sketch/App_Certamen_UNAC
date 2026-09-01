import { IconStar, IconTrophy } from "@/components/icons/AppIcons";
import type { ResultadosConcurso } from "@/types/certamen";

type ResultadosViewProps = {
  resultados: ResultadosConcurso;
  readOnly?: boolean;
};

const PODIO_TOTAL = [
  {
    titulo: "Primera mejor tuna",
    subtitulo: "Mayor puntaje total del certamen",
    rank: 1,
    accent: "from-unac-navy to-unac-blue",
    ring: "ring-brand",
    badge: "bg-brand text-unac-navy",
    iconClass: "text-brand",
  },
  {
    titulo: "Segunda mejor tuna",
    subtitulo: "Segundo lugar en puntaje total",
    rank: 2,
    accent: "from-unac-navy to-[#0e3568]",
    ring: "ring-white/20",
    badge: "bg-white/15 text-white",
    iconClass: "text-white/90",
  },
] as const;

function formatPuntaje(value: number) {
  return value.toFixed(3);
}

function GanadorTotalCard({
  titulo,
  subtitulo,
  nombre,
  puntaje,
  accent,
  ring,
  badge,
  iconClass,
  vacante,
}: {
  titulo: string;
  subtitulo: string;
  nombre: string | null;
  puntaje: number | null;
  accent: string;
  ring: string;
  badge: string;
  iconClass: string;
  vacante?: boolean;
}) {
  return (
    <article
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${accent} p-6 text-white shadow-xl ring-2 ${ring} sm:p-8`}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-brand/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
            Puntaje total
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-3xl">
            {titulo}
          </h2>
          <p className="mt-1 text-sm text-white/70">{subtitulo}</p>
        </div>
        <div className={`rounded-xl bg-white/10 p-3 ${iconClass}`}>
          <IconTrophy className="h-8 w-8" />
        </div>
      </div>

      <div className="relative mt-8">
        {vacante || !nombre ? (
          <p className="text-lg font-medium text-white/60">Por definir</p>
        ) : (
          <>
            <p className="text-xl font-bold leading-snug sm:text-2xl">{nombre}</p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${badge}`}>
                Ganadora
              </span>
              <p className="text-4xl font-bold tabular-nums text-brand sm:text-5xl">
                {formatPuntaje(puntaje ?? 0)}
              </p>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

function PremioCategoriaCard({
  categoriaNombre,
  ganadorNombre,
  puntaje,
}: {
  categoriaNombre: string;
  ganadorNombre: string | null;
  puntaje: number | null;
}) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-brand/40 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-unac-gold-hover to-brand" />
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-brand-soft p-2.5 text-brand">
          <IconStar className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-unac-blue">
            Premio individual
          </p>
          <h3 className="mt-1 text-lg font-bold text-text">{categoriaNombre}</h3>
          {ganadorNombre ? (
            <>
              <p className="mt-3 text-base font-semibold text-text">
                {ganadorNombre}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-brand">
                {formatPuntaje(puntaje ?? 0)}
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-text-muted">Por definir</p>
          )}
        </div>
      </div>
    </article>
  );
}

export function ResultadosView({ resultados, readOnly = false }: ResultadosViewProps) {
  const { concurso, rankingGeneral, porCategoria } = resultados;
  const premiosIndividuales = porCategoria.filter((rc) => rc.categoria.tienePremio);
  const primera = rankingGeneral[0] ?? null;
  const segunda = rankingGeneral[1] ?? null;

  return (
    <div className="space-y-10">
      {readOnly ? (
        <p className="text-sm text-text-muted">
          Rankings calculados en tiempo real. No puedes modificar notas desde aqui.
        </p>
      ) : null}

      <div className="section-heading text-center">
        <p className="section-eyebrow">Gran final</p>
        <h2 className="section-title">{concurso.nombre}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-text-muted">
          Ganadoras por puntaje total del certamen y premios por categoria
          configurados con trofeo.
        </p>
      </div>

      <section className="space-y-4">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-unac-blue">
            Clasificacion general
          </p>
          <h3 className="mt-1 text-xl font-bold text-text">Mejores tunas del certamen</h3>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {PODIO_TOTAL.map((podio, index) => {
            const entry = index === 0 ? primera : segunda;
            return (
              <GanadorTotalCard
                key={podio.titulo}
                titulo={podio.titulo}
                subtitulo={podio.subtitulo}
                nombre={entry?.participanteNombre ?? null}
                puntaje={entry?.puntajeTotal ?? null}
                accent={podio.accent}
                ring={podio.ring}
                badge={podio.badge}
                iconClass={podio.iconClass}
                vacante={!entry || entry.puntajeTotal <= 0}
              />
            );
          })}
        </div>
      </section>

      {premiosIndividuales.length > 0 ? (
        <section className="space-y-5">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-unac-blue">
              Premios por categoria
            </p>
            <h3 className="mt-1 text-xl font-bold text-text">Premios individuales</h3>
            <p className="mt-1 text-sm text-text-muted">
              Solo categorias marcadas con premio en configuracion.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {premiosIndividuales.map((rc) => (
              <PremioCategoriaCard
                key={rc.categoria.id}
                categoriaNombre={rc.categoria.nombre}
                ganadorNombre={rc.ganador?.participanteNombre ?? null}
                puntaje={rc.ganador?.puntaje ?? null}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="card-panel p-6 text-center">
          <p className="text-sm text-text-muted">
            No hay categorias con premio individual configuradas.
          </p>
        </section>
      )}
    </div>
  );
}
