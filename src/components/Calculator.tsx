import { useState } from 'react';
import { Delete, Divide, Minus, Plus, X, Equal, Sun, Moon } from 'lucide-react';
import { calculateSum, calculateSubtraction } from '../logic/operationsA';
import { calculateProduct, calculateDivision } from '../logic/operationsB';
import {
  calculateSquareRoot,
  calculatePower,
  calculateSin,
  calculateCos,
  calculateTan,
  calculateLog,
  PI,
} from '../logic/operationsScience';
import Display from './Display';
import Button from './Button';

type Operation = '+' | '-' | '*' | '/' | '^' | null;

export interface HistoryEntry {
  expression: string;
  result: string;
  timestamp: Date;
}

interface CalculatorProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onAddHistory: (entry: HistoryEntry) => void;
}

export default function Calculator({ theme, onToggleTheme, onAddHistory }: CalculatorProps) {
  const [currentOperand, setCurrentOperand] = useState('0');
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [expressionStr, setExpressionStr] = useState('');
  const [sciMode, setSciMode] = useState(false);

  const clear = () => {
    setCurrentOperand('0');
    setPreviousOperand(null);
    setOperation(null);
    setOverwrite(false);
    setExpressionStr('');
  };

  const deleteLast = () => {
    if (overwrite) { setCurrentOperand('0'); setOverwrite(false); return; }
    if (currentOperand.length === 1) { setCurrentOperand('0'); return; }
    setCurrentOperand(currentOperand.slice(0, -1));
  };

  const appendNumber = (number: string) => {
    if (number === '.' && currentOperand.includes('.')) return;
    if (overwrite) {
      setCurrentOperand(number === '.' ? '0.' : number);
      setOverwrite(false);
      return;
    }
    if (currentOperand === '0' && number !== '.') {
      setCurrentOperand(number);
      return;
    }
    setCurrentOperand(currentOperand + number);
  };

  const opSymbol = (op: Operation): string =>
    op === '*' ? '×' : op === '/' ? '÷' : op ?? '';

  const evaluate = (): string => {
    const prev = parseFloat(previousOperand || '0');
    const current = parseFloat(currentOperand);
    if (isNaN(prev) || isNaN(current)) return '';
    let result = 0;
    switch (operation) {
      case '+': result = calculateSum(prev, current); break;
      case '-': result = calculateSubtraction(prev, current); break;
      case '*': result = calculateProduct(prev, current); break;
      case '/':
        if (current === 0) return 'Erreur';
        result = calculateDivision(prev, current); break;
      case '^': result = calculatePower(prev, current); break;
    }
    return result.toString();
  };

  const chooseOperation = (op: Operation) => {
    if (!op) return;
    if (previousOperand !== null) {
      const result = evaluate();
      if (result === 'Erreur') { setCurrentOperand('Erreur'); return; }
      setExpressionStr(`${result} ${opSymbol(op)}`);
      setPreviousOperand(result);
      setCurrentOperand(result);
    } else {
      setExpressionStr(`${currentOperand} ${opSymbol(op)}`);
      setPreviousOperand(currentOperand);
    }
    setOverwrite(true);
    setOperation(op);
  };

  const handleEqual = () => {
    if (!operation || !previousOperand) return;
    const result = evaluate();
    const expr = `${previousOperand} ${opSymbol(operation)} ${currentOperand} =`;
    setExpressionStr(expr);
    setCurrentOperand(result);
    onAddHistory({ expression: expr, result, timestamp: new Date() });
    setPreviousOperand(null);
    setOperation(null);
    setOverwrite(true);
  };

  const handleUnary = (fn: (v: number) => number, label: string) => {
    const val = parseFloat(currentOperand);
    if (isNaN(val)) return;
    const result = fn(val);
    const expr = `${label}(${currentOperand})`;
    setExpressionStr(`${expr} =`);
    setCurrentOperand(result.toString());
    onAddHistory({ expression: `${expr} =`, result: result.toString(), timestamp: new Date() });
    setOverwrite(true);
  };

  const isDark = theme === 'dark';

  return (
    <div className="glass-card calc-wrapper animate-in">
      {/* Display */}
      <Display
        currentOperand={currentOperand}
        previousOperand={previousOperand}
        operation={operation}
        expression={expressionStr}
      />

      {/* Mode bar */}
      <div className="calc-tab-bar">
        <button
          className={`calc-tab ${!sciMode ? 'active' : ''}`}
          onClick={() => setSciMode(false)}
        >Standard</button>
        <button
          className={`calc-tab ${sciMode ? 'active' : ''}`}
          onClick={() => setSciMode(true)}
        >Scientifique</button>
        <button
          onClick={onToggleTheme}
          className="calc-tab"
          title="Changer de thème"
          style={{ maxWidth: 40 }}
        >
          {isDark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>

      {/* Scientific row */}
      {sciMode && (
        <div className="btn-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          <Button variant="sci" onClick={() => handleUnary(calculateSquareRoot, '√')}>√</Button>
          <Button variant="sci" onClick={() => handleUnary(calculateLog, 'log')}>log</Button>
          <Button variant="sci" onClick={() => handleUnary(calculateSin, 'sin')}>sin</Button>
          <Button variant="sci" onClick={() => handleUnary(calculateCos, 'cos')}>cos</Button>
          <Button variant="sci" onClick={() => handleUnary(calculateTan, 'tan')}>tan</Button>
          <Button variant="sci" onClick={() => chooseOperation('^')}>xʸ</Button>
          <Button variant="sci" onClick={() => { appendNumber(PI.toString()); }}>π</Button>
          <Button variant="sci" onClick={() => appendNumber('(')}>( </Button>
          <Button variant="sci" onClick={() => appendNumber(')')}>)</Button>
          <Button variant="sci" onClick={() => appendNumber('e')}>e</Button>
        </div>
      )}

      {/* Main grid */}
      <div className="btn-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {/* Row 1 */}
        <Button variant="secondary" onClick={clear} span2>AC</Button>
        <Button variant="secondary" icon={Delete} onClick={deleteLast}>DEL</Button>
        <Button variant={operation === '/' ? 'active-op' : 'accent'} icon={Divide} onClick={() => chooseOperation('/')} />
        {/* Row 2 */}
        <Button onClick={() => appendNumber('7')}>7</Button>
        <Button onClick={() => appendNumber('8')}>8</Button>
        <Button onClick={() => appendNumber('9')}>9</Button>
        <Button variant={operation === '*' ? 'active-op' : 'accent'} icon={X} onClick={() => chooseOperation('*')} />
        {/* Row 3 */}
        <Button onClick={() => appendNumber('4')}>4</Button>
        <Button onClick={() => appendNumber('5')}>5</Button>
        <Button onClick={() => appendNumber('6')}>6</Button>
        <Button variant={operation === '-' ? 'active-op' : 'accent'} icon={Minus} onClick={() => chooseOperation('-')} />
        {/* Row 4 */}
        <Button onClick={() => appendNumber('1')}>1</Button>
        <Button onClick={() => appendNumber('2')}>2</Button>
        <Button onClick={() => appendNumber('3')}>3</Button>
        <Button variant={operation === '+' ? 'active-op' : 'accent'} icon={Plus} onClick={() => chooseOperation('+')} />
        {/* Row 5 */}
        <Button onClick={() => appendNumber('0')} span2>0</Button>
        <Button onClick={() => appendNumber('.')}>.</Button>
        <Button variant="primary" icon={Equal} onClick={handleEqual} />
      </div>
    </div>
  );
}
