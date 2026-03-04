import { Clock, Trash2, Hash } from 'lucide-react';
import type { HistoryEntry } from './Calculator';

interface HistoryPanelProps {
    history: HistoryEntry[];
    onClear: () => void;
    onUseResult: (result: string) => void;
}

export default function HistoryPanel({ history, onClear, onUseResult }: HistoryPanelProps) {
    const reversed = [...history].reverse();

    return (
        <div className="glass-card history-wrapper animate-in">
            <div className="history-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={16} style={{ color: 'var(--neon-2)' }} />
                    <span className="history-title">Historique</span>
                    <span style={{
                        background: 'rgba(108,99,255,0.2)',
                        color: 'var(--neon-2)',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 20,
                    }}>
                        {history.length}
                    </span>
                </div>
                {history.length > 0 && (
                    <button
                        className="graph-btn danger"
                        onClick={onClear}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                        <Trash2 size={13} /> Effacer
                    </button>
                )}
            </div>

            <div className="history-list">
                {reversed.length === 0 ? (
                    <div className="history-empty">
                        <Hash size={40} style={{ opacity: 0.2 }} />
                        <span style={{ fontSize: 14 }}>Aucun calcul effectué</span>
                        <span style={{ fontSize: 11 }}>Vos calculs apparaîtront ici</span>
                    </div>
                ) : (
                    reversed.map((entry, idx) => (
                        <div
                            key={idx}
                            className="history-item"
                            onClick={() => onUseResult(entry.result)}
                            title="Cliquer pour réutiliser le résultat"
                        >
                            <div className="history-expr">{entry.expression}</div>
                            <div className="history-result">= {entry.result}</div>
                            <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                                {entry.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
