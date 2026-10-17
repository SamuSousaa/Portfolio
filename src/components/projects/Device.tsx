import Image from "next/image";

/**
 * Tela de celular (390×844) num retângulo reto, com a borda fina do tema: só a
 * captura, sem imitar o aparelho. A largura vem de fora, o resto acompanha.
 */
export function MobileShot({ src, alt, sizes, priority, className = "" }: { src: string; alt: string; sizes: string; priority?: boolean; className?: string }) {
  return (
    <div className={`relative aspect-[390/844] overflow-hidden border border-line-strong bg-surface ${className}`}>
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} quality={90} className="object-cover object-top" />
    </div>
  );
}
