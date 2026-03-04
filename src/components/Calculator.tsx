import { useState } from 'react';
import { Delete, Divide, Minus, Plus, X, Equal, Calculator as CalcIcon, Sun, Moon } from 'lucide-react';

// Import Logic Modules (Group A & B)
import { calculateSum, calculateSubtraction } from '../logic/operationsA';
import { calculateProduct, calculateDivision } from '../logic/operationsB';
// Import Science Module
import { calculateSquareRoot, calculatePower, calculateSin, calculateCos, calculateTan, calculateLog, PI } from '../logic/operationsScience';

// Import UI Components (Group C)
import Display from './Display';
import Button from './Button';

type Operation = '+' | '-' | '*' | '/' | '^' | null;
type Theme = 'light' | 'dark';

interface CalculatorProps {
  theme?: Theme;
  onToggleTheme?: () => void;
}

export default function Calculator({ theme = 'dark', onToggleTheme }: CalculatorProps) {
  const isDark = theme === 'dark';
  const [currentOperand, setCurrentOperand] = useState('0');
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [showScientific, setShowScientific] = useState(false);

  const clear = () => {
    setCurrentOperand('0');
    setPreviousOperand(null);
    setOperation(null);
    setOverwrite(false);
  };

  const deleteLast = () => {
    if (overwrite) {
      setCurrentOperand('0');
      setOverwrite(false);
      return;
    }
    if (currentOperand.length === 1) {
      setCurrentOperand('0');
      return;
    }
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

  const chooseOperation = (op: Operation) => {
    if (currentOperand === null) return;
    
    if (previousOperand !== null) {
      const result = evaluate();
      setPreviousOperand(result);
      setCurrentOperand(result);
      setOverwrite(true);
    } else {
      setPreviousOperand(currentOperand);
      setOverwrite(true);
    }
    setOperation(op);
  };

  const handleUnaryScientific = (func: (val: number) => number) => {
    const current = parseFloat(currentOperand);
    if (isNaN(current)) return;
    const result = func(current);
    setCurrentOperand(result.toString());
    setOverwrite(true);
  };

  const evaluate = (): string => {
    const prev = parseFloat(previousOperand || '0');
    const current = parseFloat(currentOperand);
    if (isNaN(prev) || isNaN(current)) return '';
    
    let computation = 0;
    
    // Dispatch to appropriate logic module
    switch (operation) {
      case '+':
        computation = calculateSum(prev, current); // Group A
        break;
      case '-':
        computation = calculateSubtraction(prev, current); // Group A
        break;
      case '*':
        computation = calculateProduct(prev, current); // Group B
        break;
      case '/':
        computation = calculateDivision(prev, current); // Group B
        break;
      case '^':
        computation = calculatePower(prev, current); // Science Module
        break;
    }
    
    return computation.toString();
  };

  const handleEqual = () => {
    if (!operation || !previousOperand) return;
    
    const result = evaluate();
    setCurrentOperand(result);
    setPreviousOperand(null);
    setOperation(null);
    setOverwrite(true);
  };

  const calcBg = isDark ? 'bg-slate-900' : 'bg-white';
  const calcBorder = isDark ? 'border-slate-800' : 'border-slate-200';
  const barBg = isDark ? 'bg-slate-950' : 'bg-slate-100';
  const barBorder = isDark ? 'border-slate-800' : 'border-slate-200';
  const barText = isDark ? 'text-slate-500' : 'text-slate-600';
  const btnToggleBg = isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300';
  const btnToggleText = isDark ? 'text-indigo-400' : 'text-indigo-600';
  const gridBg = isDark ? 'bg-slate-800' : 'bg-slate-200';

  return (
    <div className={`w-full mx-auto ${calcBg} rounded-3xl shadow-2xl overflow-hidden border ${calcBorder} transition-all duration-300 ${showScientific ? 'max-w-md' : 'max-w-xs'}`}>
      {/* Group C: Display Component */}
      <Display
        theme={theme}
        currentOperand={currentOperand}
        previousOperand={previousOperand}
        operation={operation}
      />

      {/* Mode Toggle + Thème */}
      <div className={`${barBg} px-4 py-2 flex justify-between items-center border-b ${barBorder}`}>
        <span className={`text-xs ${barText} font-medium uppercase tracking-wider`}>
          {showScientific ? 'Mode Scientifique' : 'Mode Standard'}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleTheme?.()}
            className={`p-2 rounded-full ${btnToggleBg} ${isDark ? 'text-amber-500' : 'text-amber-600'} transition-colors`}
            title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setShowScientific(!showScientific)}
            className={`p-2 rounded-full ${btnToggleBg} ${btnToggleText} transition-colors`}
            title="Basculer le mode scientifique"
          >
            <CalcIcon size={16} />
          </button>
        </div>
      </div>

      {/* Group C: Layout & Buttons */}
      <div className={`grid gap-0.5 ${gridBg} p-0.5 ${showScientific ? 'grid-cols-5' : 'grid-cols-4'}`}>
        
        {/* Scientific Column (Only visible in scientific mode) */}
        {showScientific && (
          <>
            <Button theme={theme} onClick={() => handleUnaryScientific(calculateSquareRoot)} variant="accent" className="text-lg">√</Button>
            <Button theme={theme} onClick={() => chooseOperation('^')} variant="accent" className="text-lg">xʸ</Button>
            <Button theme={theme} onClick={() => handleUnaryScientific(calculateSin)} variant="accent" className="text-lg">sin</Button>
            <Button theme={theme} onClick={() => handleUnaryScientific(calculateCos)} variant="accent" className="text-lg">cos</Button>
            <Button theme={theme} onClick={() => handleUnaryScientific(calculateTan)} variant="accent" className="text-lg">tan</Button>
          </>
        )}

        {/* Standard Keypad (rearranged slightly for grid flow if needed, but keeping standard layout mostly intact) */}
        {/* We need to wrap the standard grid to fit alongside scientific or just inject them. 
            Grid auto-flow is tricky with fixed columns. Let's use a conditional rendering approach for the whole grid 
            or just insert the scientific buttons in a specific way.
            
            Actually, changing grid-cols-5 means we need 5 items per row.
            Let's redesign the rows for 5 columns when scientific is on.
        */}

        {showScientific ? (
          // SCIENTIFIC LAYOUT (5 columns)
          <>
            {/* Row 1 */}
            <Button theme={theme} onClick={() => handleUnaryScientific(calculateSquareRoot)} variant="accent">√</Button>
            <Button theme={theme} onClick={clear} variant="secondary">AC</Button>
            <Button theme={theme} onClick={deleteLast} variant="secondary"><Delete size={20}/></Button>
            <Button theme={theme} onClick={() => chooseOperation('/')} variant={operation === '/' ? 'primary' : 'accent'}><Divide size={20}/></Button>
            <Button theme={theme} onClick={() => handleUnaryScientific(calculateLog)} variant="accent">log</Button>

            {/* Row 2 */}
            <Button theme={theme} onClick={() => chooseOperation('^')} variant="accent">xʸ</Button>
            <Button theme={theme} onClick={() => appendNumber('7')}>7</Button>
            <Button theme={theme} onClick={() => appendNumber('8')}>8</Button>
            <Button theme={theme} onClick={() => appendNumber('9')}>9</Button>
            <Button theme={theme} onClick={() => chooseOperation('*')} variant={operation === '*' ? 'primary' : 'accent'}><X size={20}/></Button>

            {/* Row 3 */}
            <Button theme={theme} onClick={() => handleUnaryScientific(calculateSin)} variant="accent">sin</Button>
            <Button theme={theme} onClick={() => appendNumber('4')}>4</Button>
            <Button theme={theme} onClick={() => appendNumber('5')}>5</Button>
            <Button theme={theme} onClick={() => appendNumber('6')}>6</Button>
            <Button theme={theme} onClick={() => chooseOperation('-')} variant={operation === '-' ? 'primary' : 'accent'}><Minus size={20}/></Button>

            {/* Row 4 */}
            <Button theme={theme} onClick={() => handleUnaryScientific(calculateCos)} variant="accent">cos</Button>
            <Button theme={theme} onClick={() => appendNumber('1')}>1</Button>
            <Button theme={theme} onClick={() => appendNumber('2')}>2</Button>
            <Button theme={theme} onClick={() => appendNumber('3')}>3</Button>
            <Button theme={theme} onClick={() => chooseOperation('+')} variant={operation === '+' ? 'primary' : 'accent'}><Plus size={20}/></Button>

            {/* Row 5 */}
            <Button theme={theme} onClick={() => handleUnaryScientific(calculateTan)} variant="accent">tan</Button>
            <Button theme={theme} onClick={() => appendNumber('0')}>0</Button>
            <Button theme={theme} onClick={() => appendNumber('.')}>.</Button>
            <Button theme={theme} onClick={() => appendNumber(PI.toString())} variant="accent">π</Button>
            <Button theme={theme} onClick={handleEqual} variant="primary"><Equal size={20}/></Button>
          </>
        ) : (
          // STANDARD LAYOUT (4 columns)
          <>
            {/* Row 1 */}
            <Button theme={theme} onClick={clear} variant="secondary" className="col-span-2">AC</Button>
            <Button theme={theme} onClick={deleteLast} variant="secondary" icon={Delete}>DEL</Button>
            <Button theme={theme} onClick={() => chooseOperation('/')} variant={operation === '/' ? 'primary' : 'accent'} icon={Divide}>/</Button>

            {/* Row 2 */}
            <Button theme={theme} onClick={() => appendNumber('7')}>7</Button>
            <Button theme={theme} onClick={() => appendNumber('8')}>8</Button>
            <Button theme={theme} onClick={() => appendNumber('9')}>9</Button>
            <Button theme={theme} onClick={() => chooseOperation('*')} variant={operation === '*' ? 'primary' : 'accent'} icon={X}>*</Button>

            {/* Row 3 */}
            <Button theme={theme} onClick={() => appendNumber('4')}>4</Button>
            <Button theme={theme} onClick={() => appendNumber('5')}>5</Button>
            <Button theme={theme} onClick={() => appendNumber('6')}>6</Button>
            <Button theme={theme} onClick={() => chooseOperation('-')} variant={operation === '-' ? 'primary' : 'accent'} icon={Minus}>-</Button>

            {/* Row 4 */}
            <Button theme={theme} onClick={() => appendNumber('1')}>1</Button>
            <Button theme={theme} onClick={() => appendNumber('2')}>2</Button>
            <Button theme={theme} onClick={() => appendNumber('3')}>3</Button>
            <Button theme={theme} onClick={() => chooseOperation('+')} variant={operation === '+' ? 'primary' : 'accent'} icon={Plus}>+</Button>

            {/* Row 5 */}
            <Button theme={theme} onClick={() => appendNumber('0')} className="col-span-2 rounded-bl-3xl">0</Button>
            <Button theme={theme} onClick={() => appendNumber('.')}>.</Button>
            <Button theme={theme} onClick={handleEqual} variant="primary" className="rounded-br-3xl" icon={Equal}>=</Button>
          </>
        )}
      </div>
    </div>
  );
}
