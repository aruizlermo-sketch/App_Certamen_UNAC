import Image from "next/image";

type BrandLogoProps = {
  variant?: "light" | "dark";
};

export function BrandLogo({ variant = "light" }: BrandLogoProps) {
  const isLight = variant === "light";

  return (
    <div className="flex items-center gap-3">
      <Image
        src="/unac-logo.png"
        alt="Universidad Nacional del Callao"
        width={48}
        height={48}
        className="h-10 w-10 object-contain"
        priority
      />
      <div className="text-left leading-tight">
        <p
          className={`text-sm font-bold uppercase tracking-wide ${
            isLight ? "text-white" : "text-unac-blue"
          }`}
        >
          UNAC
        </p>
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${
            isLight ? "text-white/60" : "text-text-muted"
          }`}
        >
          Certamen de Tunas
        </p>
      </div>
    </div>
  );
}

export function BrandHeader() {
  return <BrandLogo variant="light" />;
}
