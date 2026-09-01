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
  onClick: () => void;
};

export function ParticipanteTile({
  nombre,
  escudoUrl,
  orden,
  active = false,
  onClick,
}: ParticipanteTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex aspect-square w-[6.75rem] shrink-0 flex-col items-center justify-center gap-2 rounded-xl border p-2 text-center transition sm:w-28 ${
        active
          ? "border-unac-blue bg-blue-soft font-semibold text-unac-blue shadow-[0_0_0_2px_rgb(39_108_170_/_0.15)]"
          : "border-border bg-card text-text hover:border-unac-blue hover:bg-blue-soft"
      }`}
    >
      {escudoUrl ? (
        <EscudoParticipante url={escudoUrl} nombre={nombre} size="xl" />
      ) : (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-page-bg text-sm font-bold text-text-muted">
          {orden}
        </span>
      )}
      <span className="line-clamp-3 text-[10px] font-semibold leading-tight sm:text-[11px]">
        {nombre}
      </span>
    </button>
  );
}
