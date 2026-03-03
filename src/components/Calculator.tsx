import React, { useState } from 'react';
import { Delete, Divide, Minus, Plus, X, Equal, Calculator as CalcIcon } from 'lucide-react';

// Import Logic Modules (Group A & B)
import { calculateSum, calculateSubtraction } from '../logic/operationsA';
import { calculateProduct, calculateDivision } from '../logic/operationsB';
// Import Science Module
import { calculateSquareRoot, calculatePower, calculateSin, calculateCos, calculateTan, calculateLog, PI } from '../logic/operationsScience';

// Import UI Components (Group C)
import Display from './Display';
import Button from './Button';

type Operation = '+' | '-' | '*' | '/' | '^' | null;

export default function Calculator() {
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

  return (
    <div className={`w-full mx-auto bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 transition-all duration-300 ${showScientific ? 'max-w-md' : 'max-w-xs'}`}>
      {/* Group C: Display Component */}
      <Display 
        currentOperand={currentOperand} 
        previousOperand={previousOperand} 
        operation={operation} 
      />

      {/* Mode Toggle */}
      <div className="bg-slate-950 px-4 py-2 flex justify-between items-center border-b border-slate-800">
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          {showScientific ? 'Mode Scientifique' : 'Mode Standard'}
        </span>
        <button 
          onClick={() => setShowScientific(!showScientific)}
          className="p-2 rounded-full bg-slate-800 text-indigo-400 hover:bg-slate-700 transition-colors"
          title="Basculer le mode scientifique"
        >
          <CalcIcon size={16} />
        </button>
      </div>

      {/* Group C: Layout & Buttons */}
      <div className={`grid gap-0.5 bg-slate-800 p-0.5 ${showScientific ? 'grid-cols-5' : 'grid-cols-4'}`}>
        
        {/* Scientific Column (Only visible in scientific mode) */}
        {showScientific && (
          <>
            <Button onClick={() => handleUnaryScientific(calculateSquareRoot)} variant="accent" className="text-lg">√</Button>
            <Button onClick={() => chooseOperation('^')} variant="accent" className="text-lg">xʸ</Button>
            <Button onClick={() => handleUnaryScientific(calculateSin)} variant="accent" className="text-lg">sin</Button>
            <Button onClick={() => handleUnaryScientific(calculateCos)} variant="accent" className="text-lg">cos</Button>
            <Button onClick={() => handleUnaryScientific(calculateTan)} variant="accent" className="text-lg">tan</Button>
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
            <Button onClick={() => handleUnaryScientific(calculateSquareRoot)} variant="accent">√</Button>
            <Button onClick={clear} variant="secondary">AC</Button>
            <Button onClick={deleteLast} variant="secondary"><Delete size={20}/></Button>
            <Button onClick={() => chooseOperation('/')} variant={operation === '/' ? 'primary' : 'accent'}><Divide size={20}/></Button>
            <Button onClick={() => handleUnaryScientific(calculateLog)} variant="accent">log</Button>

            {/* Row 2 */}
            <Button onClick={() => chooseOperation('^')} variant="accent">xʸ</Button>
            <Button onClick={() => appendNumber('7')}>7</Button>
            <Button onClick={() => appendNumber('8')}>8</Button>
            <Button onClick={() => appendNumber('9')}>9</Button>
            <Button onClick={() => chooseOperation('*')} variant={operation === '*' ? 'primary' : 'accent'}><X size={20}/></Button>

            {/* Row 3 */}
            <Button onClick={() => handleUnaryScientific(calculateSin)} variant="accent">sin</Button>
            <Button onClick={() => appendNumber('4')}>4</Button>
            <Button onClick={() => appendNumber('5')}>5</Button>
            <Button onClick={() => appendNumber('6')}>6</Button>
            <Button onClick={() => chooseOperation('-')} variant={operation === '-' ? 'primary' : 'accent'}><Minus size={20}/></Button>

            {/* Row 4 */}
            <Button onClick={() => handleUnaryScientific(calculateCos)} variant="accent">cos</Button>
            <Button onClick={() => appendNumber('1')}>1</Button>
            <Button onClick={() => appendNumber('2')}>2</Button>
            <Button onClick={() => appendNumber('3')}>3</Button>
            <Button onClick={() => chooseOperation('+')} variant={operation === '+' ? 'primary' : 'accent'}><Plus size={20}/></Button>

            {/* Row 5 */}
            <Button onClick={() => handleUnaryScientific(calculateTan)} variant="accent">tan</Button>
            <Button onClick={() => appendNumber('0')}>0</Button>
            <Button onClick={() => appendNumber('.')}>.</Button>
            <Button onClick={() => appendNumber(PI.toString())} variant="accent">π</Button>
            <Button onClick={handleEqual} variant="primary"><Equal size={20}/></Button>
          </>
        ) : (
          // STANDARD LAYOUT (4 columns)
          <>
            {/* Row 1 */}
            <Button onClick={clear} variant="secondary" className="col-span-2">AC</Button>
            <Button onClick={deleteLast} variant="secondary" icon={Delete}>DEL</Button>
            <Button onClick={() => chooseOperation('/')} variant={operation === '/' ? 'primary' : 'accent'} icon={Divide}>/</Button>

            {/* Row 2 */}
            <Button onClick={() => appendNumber('7')}>7</Button>
            <Button onClick={() => appendNumber('8')}>8</Button>
            <Button onClick={() => appendNumber('9')}>9</Button>
            <Button onClick={() => chooseOperation('*')} variant={operation === '*' ? 'primary' : 'accent'} icon={X}>*</Button>

            {/* Row 3 */}
            <Button onClick={() => appendNumber('4')}>4</Button>
            <Button onClick={() => appendNumber('5')}>5</Button>
            <Button onClick={() => appendNumber('6')}>6</Button>
            <Button onClick={() => chooseOperation('-')} variant={operation === '-' ? 'primary' : 'accent'} icon={Minus}>-</Button>

            {/* Row 4 */}
            <Button onClick={() => appendNumber('1')}>1</Button>
            <Button onClick={() => appendNumber('2')}>2</Button>
            <Button onClick={() => appendNumber('3')}>3</Button>
            <Button onClick={() => chooseOperation('+')} variant={operation === '+' ? 'primary' : 'accent'} icon={Plus}>+</Button>

            {/* Row 5 */}
            <Button onClick={() => appendNumber('0')} className="col-span-2 rounded-bl-3xl">0</Button>
            <Button onClick={() => appendNumber('.')}>.</Button>
            <Button onClick={handleEqual} variant="primary" className="rounded-br-3xl" icon={Equal}>=</Button>
          </>
        )}
      </div>
    </div>
  );
}
