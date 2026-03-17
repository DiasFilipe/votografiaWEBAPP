"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { getColor, type MunicipioData } from "@/lib/painel/utils";

interface Props {
  filter?: "all" | "fortaleza" | "crescimento" | "fraco";
  onSelect?: (m: MunicipioData) => void;
  geojsonUrl: string;
}

export default function MapRS({ filter = "all", onSelect, geojsonUrl }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const geoLayerRef = useRef<import("leaflet").GeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    async function setup() {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([-29.5, -53.0], 6);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      }).addTo(map);

      try {
        const geoResp = await fetch(geojsonUrl);
        if (!geoResp.ok) throw new Error("fetch failed");
        const geojson = await geoResp.json();
        if (cancelled) return;

        // Ajusta o centro do mapa com base no bounding box do GeoJSON
        const tempLayer = L.geoJSON(geojson);
        const bounds = tempLayer.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });

        function buildMunicipioData(p: Record<string, unknown>): MunicipioData {
          return {
            municipio: String(p.nome ?? ""),
            cod_tse: String(p.codarea ?? ""),
            votos: Number(p.votos ?? 0),
            total_dep_fed: Number(p.total_dep_fed ?? 0),
            pct: Number(p.pct ?? 0),
            slug: String(p.slug ?? ""),
          };
        }

        function getProps(feature: GeoJSON.Feature | undefined) {
          const p = (feature?.properties ?? {}) as Record<string, unknown>;
          const pct = Number(p.pct ?? 0);
          const slug = String(p.slug ?? "");
          const nome = String(p.nome ?? "");
          const d = buildMunicipioData(p);
          return { pct, slug, nome, d };
        }

        const geoLayer = L.geoJSON(geojson, {
          style: (feature) => {
            const { pct } = getProps(feature);
            let visible = true;
            if (filter === "fortaleza") visible = pct >= 10;
            else if (filter === "crescimento") visible = pct >= 3 && pct < 10;
            else if (filter === "fraco") visible = pct < 3;
            return {
              fillColor: visible ? getColor(pct) : "#e5e7eb",
              weight: 0.8,
              opacity: 1,
              color: "#9ca3af",
              fillOpacity: visible ? 0.75 : 0.3,
            };
          },
          onEachFeature: (feature, layer) => {
            const { pct, slug, nome, d } = getProps(feature);
            if (!slug) return;

            layer.bindPopup(`
              <div style="font-family:Inter,system-ui,sans-serif;min-width:190px">
                <div style="font-weight:800;font-size:15px;margin-bottom:6px;color:#111827">${nome}</div>
                <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px">
                  <span style="color:#d97706;font-size:26px;font-weight:900;line-height:1">${pct.toFixed(1)}%</span>
                  <span style="color:#6b7280;font-size:12px">do eleitorado</span>
                </div>
                <div style="color:#374151;font-size:13px"><strong style="color:#111827">${d.votos.toLocaleString("pt-BR")}</strong> votos em 2022</div>
                <div style="margin-top:10px;padding-top:10px;border-top:1px solid #e5e7eb">
                  <a href="/painel/municipio/${slug}" style="color:#d97706;font-size:13px;font-weight:600;text-decoration:none">
                    Ver análise completa →
                  </a>
                </div>
              </div>
            `);

            layer.on("mouseover", function (this: import("leaflet").Path) {
              this.setStyle({ weight: 2, color: "#f59e0b", fillOpacity: 0.9 });
            });
            layer.on("mouseout", function () { geoLayer.resetStyle(layer); });
            layer.on("click", () => { onSelect?.(d); });
          },
        }).addTo(map);

        geoLayerRef.current = geoLayer;
        setLoading(false);
      } catch {
        setError(true);
        setLoading(false);
      }
    }

    setup();
    return () => { cancelled = true; };
  }, [geojsonUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const layer = geoLayerRef.current;
    if (!layer) return;
    layer.eachLayer((l) => {
      const gl = l as import("leaflet").GeoJSON & { feature?: GeoJSON.Feature };
      const pct: number = Number(gl.feature?.properties?.pct ?? 0);
      let visible = true;
      if (filter === "fortaleza") visible = pct >= 10;
      else if (filter === "crescimento") visible = pct >= 3 && pct < 10;
      else if (filter === "fraco") visible = pct < 3;
      (l as import("leaflet").Path).setStyle({
        fillColor: visible ? getColor(pct) : "#e5e7eb",
        fillOpacity: visible ? 0.75 : 0.3,
      });
    });
  }, [filter]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 520 }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-gray-400 text-sm">Carregando mapa...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-gray-500 text-sm">Erro ao carregar mapa.</div>
        </div>
      )}
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
