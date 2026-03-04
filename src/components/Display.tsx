interface DisplayProps {
  currentOperand: string;
  previousOperand: string | null;
  operation: string | null;
  expression: string;
}

function formatNumber(val: string): string {
  if (!val || val === 'Erreur') return val;
  const [integer, decimal] = val.split('.');
  const fmt = new Intl.NumberFormat('fr-FR').format(parseInt(integer));
  return decimal != null ? `${fmt},${decimal}` : fmt;
}

function opSymbol(op: string | null): string {
  if (op === '*') return '×';
  if (op === '/') return '÷';
  if (op === '^') return '^';
  return op ?? '';
}

export default function Display({ currentOperand, previousOperand, operation, expression }: DisplayProps) {
  const isError = currentOperand === 'Erreur';
  const prevLine = previousOperand
    ? `${formatNumber(previousOperand)} ${opSymbol(operation)}`
    : '';

  return (
    <div className="calc-display">
      <div className="calc-expression" title={expression}>
        {expression || prevLine || '\u00a0'}
      </div>
      <div className={`calc-result ${isError ? 'has-error' : ''}`}>
        {formatNumber(currentOperand)}
      </div>
    </div>
  );
}
