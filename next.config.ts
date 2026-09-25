import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 90 para as capturas dos projetos (telas com texto pequeno); 75 é o padrão do resto
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
