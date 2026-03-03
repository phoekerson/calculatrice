import React from 'react';

/**
 * MODULE GROUPE C
 * Développeurs: @Diyanatou, @Friedrich
 * Responsabilité: Composant d'affichage (Écran)
 */

interface DisplayProps {
  currentOperand: string;
  previousOperand: string | null;
  operation: string | null;
}

export default function Display({ currentOperand, previousOperand, operation }: DisplayProps) {
  const formatOperand = (operand: string) => {
    if (operand == null) return;
    const [integer, decimal] = operand.split('.');
    if (decimal == null) return new Intl.NumberFormat('fr-FR').format(parseInt(integer));
    return `${new Intl.NumberFormat('fr-FR').format(parseInt(integer))},${decimal}`;
  };

  return (
    <div className="p-6 bg-slate-950 text-right min-h-[160px] flex flex-col justify-end items-end break-all rounded-t-3xl border-b border-slate-800">
      <div className="text-slate-400 text-sm h-6 font-mono">
        {previousOperand ? `${formatOperand(previousOperand)} ${operation === '*' ? '×' : operation === '/' ? '÷' : operation}` : ''}
      </div>
      <div className="text-white text-5xl font-light tracking-tight mt-1">
        {formatOperand(currentOperand)}
      </div>
    </div>
  );
}
