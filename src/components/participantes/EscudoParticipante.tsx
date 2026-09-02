import Image from "next/image";

type EscudoParticipanteProps = {
  url: string | null | undefined;
  nombre: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZE = {
  sm: { box: "h-6 w-6", px: 24 },
  md: { box: "h-8 w-8", px: 32 },
  lg: { box: "h-12 w-12", px: 48 },
  xl: { box: "h-14 w-14", px: 56 },
} as const;

export function EscudoParticipante({
  url,
  nombre,
  size = "md",
  className = "",
}: EscudoParticipanteProps) {
  if (!url) return null;

  const { box, px } = SIZE[size];

  return (
    <Image
      src={url}
      alt={`Escudo ${nombre}`}
      width={px}
      height={px}
      className={`shrink-0 rounded-full object-contain bg-white/90 p-0.5 ${box} ${className}`}
    />
  );
}

type EscudoParticipanteBoxProps = {
  url: string | null | undefined;
  nombre: string;
  boxClassName?: string;
  imageClassName?: string;
};

/** Escudo en caja fija: usa todo el espacio disponible sin agrandar el contenedor padre. */
export function EscudoParticipanteBox({
  url,
  nombre,
  boxClassName = "h-16 w-16",
  imageClassName = "object-contain",
}: EscudoParticipanteBoxProps) {
  if (!url) return null;

  return (
    <span className={`relative inline-block shrink-0 ${boxClassName}`}>
      <Image
        src={url}
        alt={`Escudo ${nombre}`}
        fill
        sizes="128px"
        className={imageClassName}
      />
    </span>
  );
}

type ParticipanteConEscudoProps = {
  nombre: string;
  escudoUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  nombreClassName?: string;
};

export function ParticipanteConEscudo({
  nombre,
  escudoUrl,
  size = "md",
  className = "",
  nombreClassName = "",
}: ParticipanteConEscudoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <EscudoParticipante url={escudoUrl} nombre={nombre} size={size} />
      <span className={nombreClassName}>{nombre}</span>
    </span>
  );
}

type ParticipanteTileProps = {
  nombre: string;
  escudoUrl?: string | null;
  orden: number;
  active?: boolean;
  locked?: boolean;
  onClick: () => void;
};

export function ParticipanteTile({
  nombre,
  escudoUrl,
  orden,
  active = false,
  locked = false,
  onClick,
}: ParticipanteTileProps) {
  return (
    <button
      type="button"
      title={locked ? `${nombre} (evaluacion cerrada)` : nombre}
      aria-label={locked ? `${nombre}, evaluacion cerrada` : nombre}
      onClick={onClick}
      className={`relative aspect-square w-24 shrink-0 rounded-xl border p-3 transition sm:w-32 ${
        active
          ? "border-unac-blue bg-blue-soft shadow-[0_0_0_2px_rgb(39_108_170_/_0.15)]"
          : "border-border bg-card hover:border-unac-blue hover:bg-blue-soft"
      }`}
    >
      {escudoUrl ? (
        <span className="relative block h-full w-full">
          <Image
            src={escudoUrl}
            alt={`Escudo ${nombre}`}
            fill
            sizes="128px"
            className="object-contain"
          />
        </span>
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-lg bg-page-bg text-2xl font-bold text-text-muted">
          {orden}
        </span>
      )}
      {locked ? (
        <span className="absolute right-1.5 top-1.5 rounded-md bg-page-bg/90 px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted ring-1 ring-border">
          Cerrada
        </span>
      ) : null}
    </button>
  );
}
