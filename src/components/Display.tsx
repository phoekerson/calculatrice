
/**
 * MODULE GROUPE C
 * Développeurs: @Diyanatou, @Friedrich
 * Responsabilité: Composant d'affichage (Écran)
 */

type Theme = 'light' | 'dark';

interface DisplayProps {
  theme?: Theme;
  currentOperand: string;
  previousOperand: string | null;
  operation: string | null;
}

export default function Display({ theme = 'dark', currentOperand, previousOperand, operation }: DisplayProps) {
  const isDark = theme === 'dark';
  const formatOperand = (operand: string) => {
    if (operand == null) return;
    const [integer, decimal] = operand.split('.');
    if (decimal == null) return new Intl.NumberFormat('fr-FR').format(parseInt(integer));
    return `${new Intl.NumberFormat('fr-FR').format(parseInt(integer))},${decimal}`;
  };

  const bg = isDark ? 'bg-slate-950' : 'bg-slate-100';
  const border = isDark ? 'border-slate-800' : 'border-slate-200';
  const textPrev = isDark ? 'text-slate-400' : 'text-slate-500';
  const textCur = isDark ? 'text-white' : 'text-slate-900';

  return (
    <div className={`p-6 ${bg} text-right min-h-[160px] flex flex-col justify-end items-end break-all rounded-t-3xl border-b ${border}`}>
      <div className={`${textPrev} text-sm h-6 font-mono`}>
        {previousOperand ? `${formatOperand(previousOperand)} ${operation === '*' ? '×' : operation === '/' ? '÷' : operation}` : ''}
      </div>
      <div className={`${textCur} text-5xl font-light tracking-tight mt-1`}>
        {formatOperand(currentOperand)}
      </div>
    </div>
  );
}
