"use client";

import dynamic from "next/dynamic";
import type { MunicipioData } from "@/lib/painel/utils";

const MapRS = dynamic(() => import("./MapRS"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center"
      style={{ height: 520 }}
    >
      <span className="text-slate-500 text-sm">Carregando mapa...</span>
    </div>
  ),
});

interface Props {
  filter?: "all" | "fortaleza" | "crescimento" | "fraco";
  onSelect?: (m: MunicipioData) => void;
  geojsonUrl: string;
}

export default function MapRSDynamic(props: Props) {
  return <MapRS {...props} />;
}
