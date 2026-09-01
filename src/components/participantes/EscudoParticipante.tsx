import Image from "next/image";

type EscudoParticipanteProps = {
  url: string | null | undefined;
  nombre: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE = {
  sm: { box: "h-6 w-6", px: 24 },
  md: { box: "h-8 w-8", px: 32 },
  lg: { box: "h-12 w-12", px: 48 },
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
  size?: "sm" | "md" | "lg";
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
