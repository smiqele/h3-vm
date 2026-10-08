"use client";

import { useEffect, useId, useState } from "react";

let renderSequence = 0;

export function MermaidDiagram({ source }: { source: string }) {
  const instanceId = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let version = 0;

    async function render() {
      const currentVersion = ++version;
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: document.documentElement.dataset.theme === "light" ? "default" : "dark",
        });
        const result = await mermaid.render(`mermaid-${instanceId}-${++renderSequence}`, source);
        if (active && currentVersion === version) {
          setSvg(result.svg);
          setError(false);
        }
      } catch {
        if (active && currentVersion === version) setError(true);
      }
    }

    void render();
    const observer = new MutationObserver(() => void render());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [instanceId, source]);

  if (error) return <pre><code data-language="mermaid">{source}</code></pre>;
  return <div className="markdown-mermaid" role="img" aria-label="Диаграмма документа" dangerouslySetInnerHTML={{ __html: svg }} />;
}
