import { notFound } from "next/navigation";

/*
 * Com dois layouts raiz ((site) e (briefing)), um endereço que não existe não
 * pertence a nenhum deles. Esta rota coringa mantém o 404 dentro do layout do
 * site, com sidebar e topo, como antes.
 */
export default function NaoEncontrada() {
  notFound();
}
