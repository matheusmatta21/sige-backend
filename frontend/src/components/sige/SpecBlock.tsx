import { useState } from 'react';

export interface ScreenSpec {
  id: string;
  title: string;
  objective: string;
  dataPoints: string[];
  interactions: string[];
}

export function SpecBlock({ spec }: { spec: ScreenSpec }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8 border-t border-dashed pt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="hud-label flex items-center gap-2 transition-colors hover:text-foreground"
      >
        <span>{open ? '−' : '+'}</span>
        <span>
          {open ? 'OCULTAR' : 'VER'} ESPECIFICAÇÃO DA TELA (SEÇÃO 4.3) ·{' '}
          {spec.id} · {spec.title}
        </span>
      </button>

      {open && (
        <div className="hud-panel mt-3 grid grid-cols-3 gap-6 p-5 text-xs">
          <div>
            <div className="hud-label mb-1.5">Objetivo</div>
            <p className="leading-relaxed text-muted-foreground">
              {spec.objective}
            </p>
          </div>
          <div>
            <div className="hud-label mb-1.5">Dados & Métricas</div>
            <ul className="space-y-1 text-muted-foreground">
              {spec.dataPoints.map((d) => (
                <li key={d}>• {d}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="hud-label mb-1.5">Interações</div>
            <ul className="space-y-1 text-muted-foreground">
              {spec.interactions.map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
