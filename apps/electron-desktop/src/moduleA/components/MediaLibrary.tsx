// ============================================================================
// Media Library component for Module A
// Browse, upload, preview, and apply social platform crop/aspect ratio presets:
//   - LinkedIn: 1.91:1 (Landscape) / 1:1 (Square)
//   - Instagram: 1:1 (Square) / 4:5 (Portrait) / 9:16 (Story/Reel)
//   - Twitter/X: 16:9 (Landscape) / 1:1 (Square)
//   - Facebook: 1.91:1 / 1:1
//   - TikTok / YouTube Shorts: 9:16
// ============================================================================

import { useState } from "react";
import { Image as ImageIcon, Upload, Check, Trash2, Maximize2, Sparkles, Filter } from "lucide-react";

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  size: string;
  dimensions: string;
  platformPreset?: string;
  aspectRatio: string;
}

const DEFAULT_ASSETS: MediaAsset[] = [
  {
    id: "asset-1",
    name: "product-launch-hero.png",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    size: "420 KB",
    dimensions: "1200 x 628",
    platformPreset: "LinkedIn Landscape (1.91:1)",
    aspectRatio: "1.91:1",
  },
  {
    id: "asset-2",
    name: "receptionist-ai-square.png",
    url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
    size: "310 KB",
    dimensions: "1080 x 1080",
    platformPreset: "Instagram / LinkedIn Square (1:1)",
    aspectRatio: "1:1",
  },
  {
    id: "asset-3",
    name: "features-vertical-story.png",
    url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80",
    size: "540 KB",
    dimensions: "1080 x 1920",
    platformPreset: "TikTok / Shorts / Reels (9:16)",
    aspectRatio: "9:16",
  },
  {
    id: "asset-4",
    name: "growth-metrics-banner.png",
    url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&auto=format&fit=crop&q=80",
    size: "380 KB",
    dimensions: "1200 x 675",
    platformPreset: "Twitter / X Card (16:9)",
    aspectRatio: "16:9",
  },
];

const PRESETS = [
  { label: "All Formats", ratio: "all" },
  { label: "LinkedIn / FB (1.91:1)", ratio: "1.91:1" },
  { label: "Square Post (1:1)", ratio: "1:1" },
  { label: "Twitter / X (16:9)", ratio: "16:9" },
  { label: "Shorts / Reels / TikTok (9:16)", ratio: "9:16" },
];

interface MediaLibraryProps {
  onSelectImage?: (url: string) => void;
}

export function MediaLibrary({ onSelectImage }: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>(DEFAULT_ASSETS);
  const [selectedRatio, setSelectedRatio] = useState<string>("all");
  const [activeAsset, setActiveAsset] = useState<MediaAsset | null>(null);

  const filtered = selectedRatio === "all"
    ? assets
    : assets.filter((a) => a.aspectRatio === selectedRatio);

  function handleUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const objectUrl = URL.createObjectURL(file);
      const newAsset: MediaAsset = {
        id: `asset-${Date.now()}`,
        name: file.name,
        url: objectUrl,
        size: `${Math.round(file.size / 1024)} KB`,
        dimensions: "Auto-detected",
        aspectRatio: "1:1",
        platformPreset: "Custom Upload",
      };
      setAssets([newAsset, ...assets]);
    };
    input.click();
  }

  function handleDelete(id: string) {
    setAssets(assets.filter((a) => a.id !== id));
    if (activeAsset?.id === id) setActiveAsset(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", height: "100%" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>Media Library & Asset Presets</h2>
          <p className="muted-text" style={{ margin: "0.25rem 0 0" }}>
            Manage images and crop presets tailored for each social media platform.
          </p>
        </div>
        <button className="primary-button" onClick={handleUpload}>
          <Upload size={14} /> Upload Image
        </button>
      </div>

      {/* Preset filter chips */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <Filter size={13} /> Platform Preset:
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.ratio}
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "999px",
              border: "1px solid var(--color-border)",
              background: selectedRatio === p.ratio ? "var(--color-primary)" : "var(--color-surface)",
              color: selectedRatio === p.ratio ? "#fff" : "var(--color-text)",
              fontSize: "0.8rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onClick={() => setSelectedRatio(p.ratio)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Grid of assets */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        {filtered.map((asset) => (
          <div
            key={asset.id}
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              overflow: "hidden",
              background: "var(--color-surface)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                height: "150px",
                backgroundColor: "rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img
                src={asset.url}
                alt={asset.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: "6px",
                  right: "6px",
                  background: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  fontSize: "0.7rem",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {asset.aspectRatio}
              </span>
            </div>
            <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {asset.name}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                {asset.platformPreset} • {asset.size}
              </div>
              <div style={{ marginTop: "auto", paddingTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                {onSelectImage && (
                  <button
                    style={{
                      flex: 1,
                      padding: "0.35rem 0.5rem",
                      fontSize: "0.75rem",
                      borderRadius: "4px",
                      border: "1px solid var(--color-primary)",
                      background: "rgba(var(--color-primary-rgb, 59,130,246), 0.1)",
                      color: "var(--color-primary)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.25rem",
                    }}
                    onClick={() => onSelectImage(asset.url)}
                  >
                    <Check size={12} /> Use
                  </button>
                )}
                <button
                  style={{
                    padding: "0.35rem 0.5rem",
                    fontSize: "0.75rem",
                    borderRadius: "4px",
                    border: "1px solid var(--color-border)",
                    background: "transparent",
                    color: "var(--color-danger, #ef4444)",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDelete(asset.id)}
                  title="Delete asset"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
