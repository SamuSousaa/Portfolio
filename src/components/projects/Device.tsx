import Image from "next/image";

/**
 * Celular em pé (390×844) desenhado em CSS com as linhas do tema: a tela é a captura
 * real, a moldura acompanha o tema ativo. A largura vem de fora, o resto acompanha.
 */
export function Phone({ src, alt, sizes, priority, className = "" }: { src: string; alt: string; sizes: string; priority?: boolean; className?: string }) {
  return (
    <div className={`rounded-[13%/6%] border border-line-strong bg-surface-2 p-[3.2%] ${className}`}>
      <div className="relative aspect-[390/844] overflow-hidden rounded-[10.5%/4.85%]">
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} quality={90} className="object-cover object-top" />
      </div>
    </div>
  );
}
