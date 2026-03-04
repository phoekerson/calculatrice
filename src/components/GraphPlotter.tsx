import { useState, useRef, useEffect, useCallback } from 'react';
import { evaluate as mathEval } from 'mathjs';
import { Plus, Trash2, ZoomIn, ZoomOut, RefreshCw, Grid } from 'lucide-react';

const CURVE_COLORS = ['#6c63ff', '#22d3ee', '#10b981', '#f59e0b'];
const CURVE_BG = ['rgba(108,99,255,0.15)', 'rgba(34,211,238,0.15)', 'rgba(16,185,129,0.15)', 'rgba(245,158,11,0.15)'];

interface Curve {
    expr: string;
    color: string;
    bg: string;
}

interface Tooltip {
    x: number;
    y: number;
    mathX: number;
    mathY: number;
}

function safeMathEval(expr: string, x: number): number | null {
    try {
        const result = mathEval(expr, { x, pi: Math.PI, e: Math.E });
        if (typeof result !== 'number' || !isFinite(result)) return null;
        return result;
    } catch {
        return null;
    }
}

export default function GraphPlotter() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [curves, setCurves] = useState<Curve[]>([
        { expr: 'sin(x)', color: CURVE_COLORS[0], bg: CURVE_BG[0] },
    ]);
    const [inputs, setInputs] = useState<string[]>(['sin(x)']);
    const [xRange, setXRange] = useState(10);
    const [showGrid, setShowGrid] = useState(true);
    const [tooltip, setTooltip] = useState<Tooltip | null>(null);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const lastMouse = useRef({ x: 0, y: 0 });

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const dpr = window.devicePixelRatio || 1;
        const W = container.clientWidth;
        const H = container.clientHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;

        const ctx = canvas.getContext('2d')!;
        ctx.scale(dpr, dpr);

        // Background
        ctx.clearRect(0, 0, W, H);

        const cx = W / 2 + panOffset.x;
        const cy = H / 2 + panOffset.y;
        const scale = (W / 2) / xRange;

        // Grid
        if (showGrid) {
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            const step = Math.pow(10, Math.floor(Math.log10(xRange)));
            for (let gx = -xRange * 3; gx <= xRange * 3; gx += step) {
                const px = cx + gx * scale;
                ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke();
            }
            const yRange = (H / 2) / scale;
            for (let gy = -yRange * 3; gy <= yRange * 3; gy += step) {
                const py = cy - gy * scale;
                ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke();
            }
        }

        // Axes
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

        // Axis ticks & labels
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        const step = Math.pow(10, Math.floor(Math.log10(xRange)));
        const numTicks = Math.ceil(xRange / step);
        for (let i = -numTicks * 2; i <= numTicks * 2; i++) {
            if (i === 0) continue;
            const v = i * step;
            const px = cx + v * scale;
            if (px < 0 || px > W) continue;
            ctx.beginPath();
            ctx.moveTo(px, cy - 4); ctx.lineTo(px, cy + 4);
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillText(v % 1 === 0 ? v.toString() : v.toFixed(1), px, cy + 14);
        }
        const yRange2 = (H / 2) / scale;
        const numTicksY = Math.ceil(yRange2 / step);
        ctx.textAlign = 'right';
        for (let i = -numTicksY * 2; i <= numTicksY * 2; i++) {
            if (i === 0) continue;
            const v = i * step;
            const py = cy - v * scale;
            if (py < 0 || py > H) continue;
            ctx.beginPath();
            ctx.moveTo(cx - 4, py); ctx.lineTo(cx + 4, py);
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillText(v % 1 === 0 ? v.toString() : v.toFixed(1), cx - 6, py + 3);
        }

        // Curves
        curves.forEach((curve) => {
            if (!curve.expr.trim()) return;
            ctx.strokeStyle = curve.color;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = curve.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            let started = false;
            const STEPS = W * 2;
            for (let px = 0; px <= STEPS; px++) {
                const screenX = (px / STEPS) * W;
                const mathX = (screenX - cx) / scale;
                const mathY = safeMathEval(curve.expr, mathX);
                if (mathY === null) { ctx.beginPath(); started = false; continue; }
                const screenY = cy - mathY * scale;
                if (!started) { ctx.moveTo(screenX, screenY); started = true; }
                else ctx.lineTo(screenX, screenY);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // Axis labels
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('x', W - 18, cy - 8);
        ctx.textAlign = 'center';
        ctx.fillText('y', cx + 10, 14);
    }, [curves, xRange, showGrid, panOffset]);

    useEffect(() => { draw(); }, [draw]);

    useEffect(() => {
        const ro = new ResizeObserver(() => draw());
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [draw]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (isPanning.current) {
            const dx = mx - lastMouse.current.x;
            const dy = my - lastMouse.current.y;
            setPanOffset(p => ({ x: p.x + dx, y: p.y + dy }));
            lastMouse.current = { x: mx, y: my };
            return;
        }

        const W = canvas.clientWidth;
        const H = canvas.clientHeight;
        const cx = W / 2 + panOffset.x;
        const cy = H / 2 + panOffset.y;
        const scale = (W / 2) / xRange;
        const mathX = (mx - cx) / scale;
        const mathY = -(my - cy) / scale;
        setTooltip({ x: mx, y: my, mathX, mathY });
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button === 1 || e.altKey) {
            isPanning.current = true;
            lastMouse.current = { x: e.clientX - canvasRef.current!.getBoundingClientRect().left, y: e.clientY - canvasRef.current!.getBoundingClientRect().top };
        }
    };
    const handleMouseUp = () => { isPanning.current = false; };
    const handleMouseLeave = () => { setTooltip(null); isPanning.current = false; };

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        setXRange(r => Math.max(0.5, Math.min(1000, r * (e.deltaY > 0 ? 1.1 : 0.9))));
    };

    const addCurve = () => {
        if (curves.length >= 4) return;
        const idx = curves.length;
        setCurves(c => [...c, { expr: '', color: CURVE_COLORS[idx], bg: CURVE_BG[idx] }]);
        setInputs(i => [...i, '']);
    };

    const removeCurve = (idx: number) => {
        setCurves(c => c.filter((_, i) => i !== idx));
        setInputs(i => i.filter((_, j) => j !== idx));
    };

    const applyInputs = () => {
        setCurves(c => c.map((curve, i) => ({ ...curve, expr: inputs[i] ?? '' })));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') applyInputs();
    };

    return (
        <div className="glass-card graph-wrapper animate-in">
            <div className="graph-header">
                <div className="graph-curves-list">
                    {inputs.map((val, idx) => (
                        <div key={idx} className="graph-input-row">
                            <div className="curve-dot" style={{ background: CURVE_COLORS[idx], boxShadow: `0 0 6px ${CURVE_COLORS[idx]}` }} />
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, color: 'var(--text-2)', minWidth: 24 }}>
                                f{idx + 1}(x) =
                            </span>
                            <input
                                className="graph-input"
                                value={val}
                                onChange={e => setInputs(in_ => in_.map((v, i) => i === idx ? e.target.value : v))}
                                onKeyDown={handleKeyDown}
                                placeholder={`ex: sin(x), x^2, 2*x+1`}
                            />
                            {curves.length > 1 && (
                                <button className="graph-btn danger" onClick={() => removeCurve(idx)} title="Supprimer">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="graph-controls">
                    <button className="graph-btn primary" onClick={applyInputs}>Tracer</button>
                    {curves.length < 4 && (
                        <button className="graph-btn" onClick={addCurve}>
                            <Plus size={13} style={{ marginRight: 4 }} />Ajouter courbe
                        </button>
                    )}
                    <button className="graph-btn" onClick={() => setXRange(r => Math.max(0.5, r * 0.5))}>
                        <ZoomIn size={13} style={{ marginRight: 4 }} />Zoom +
                    </button>
                    <button className="graph-btn" onClick={() => setXRange(r => Math.min(1000, r * 2))}>
                        <ZoomOut size={13} style={{ marginRight: 4 }} />Zoom -
                    </button>
                    <button className="graph-btn" onClick={() => { setXRange(10); setPanOffset({ x: 0, y: 0 }); }}>
                        <RefreshCw size={13} style={{ marginRight: 4 }} />Reset
                    </button>
                    <button
                        className={`graph-btn ${showGrid ? 'primary' : ''}`}
                        onClick={() => setShowGrid(s => !s)}
                    >
                        <Grid size={13} style={{ marginRight: 4 }} />Grille
                    </button>
                    <span className="range-label">X : ±{xRange % 1 === 0 ? xRange : xRange.toFixed(1)}</span>
                    <input
                        type="range" min={0.5} max={200} step={0.5}
                        value={xRange}
                        onChange={e => setXRange(parseFloat(e.target.value))}
                        className="range-input"
                        style={{ width: 100 }}
                    />
                </div>
            </div>

            <div className="graph-canvas-area" ref={containerRef}>
                <canvas
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onWheel={handleWheel}
                    style={{ cursor: 'crosshair' }}
                />
                {tooltip && (
                    <div
                        className="graph-tooltip"
                        style={{
                            left: tooltip.x + 16,
                            top: tooltip.y - 36,
                            transform: tooltip.x > (canvasRef.current?.clientWidth ?? 0) - 160
                                ? 'translateX(-120%)' : undefined,
                        }}
                    >
                        x = {tooltip.mathX.toFixed(3)} &nbsp;|&nbsp; y = {tooltip.mathY.toFixed(3)}
                    </div>
                )}
                {/* Legend */}
                <div style={{
                    position: 'absolute', bottom: 12, right: 12,
                    display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                    {curves.map((c, i) => c.expr && (
                        <div key={i} style={{
                            display: 'flex', gap: 6, alignItems: 'center',
                            background: c.bg, borderRadius: 6, padding: '3px 8px',
                            border: `1px solid ${c.color}44`,
                            backdropFilter: 'blur(8px)',
                        }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                            <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: c.color }}>
                                f{i + 1}(x) = {c.expr}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Usage hint */}
                <div style={{
                    position: 'absolute', bottom: 12, left: 12,
                    fontSize: 10, color: 'var(--text-3)',
                    fontFamily: 'Inter, sans-serif',
                }}>
                    Alt+drag pour déplacer &nbsp;·&nbsp; Molette pour zoomer &nbsp;·&nbsp; Entrée pour tracer
                </div>
            </div>
        </div>
    );
}
