import { type State } from '@/types/contract';

interface ProgressStepperProps {
  currentState: State;
}

export function ProgressStepper({ currentState }: ProgressStepperProps) {
  const states = [
    { id: 0, label: 'Fabricada', icon: '🏭' },
    { id: 1, label: 'HW Aprobado', icon: '🔧' },
    { id: 2, label: 'SW Validado', icon: '💻' },
    { id: 3, label: 'Distribuida', icon: '🎒' }
  ];

  return (
    <div className="flex items-center justify-center space-x-4 py-4">
      {states.map((state, index) => (
        <div key={state.id} className="flex flex-col items-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl
              ${currentState >= state.id ? 'bg-primary' : 'bg-gray-300'}
              ${index < states.length - 1 ? 'z-10' : ''}
            `}
          >
            {state.icon}
          </div>
          <div
            className={`text-xs mt-2 text-center min-w-[80px] px-1
              ${currentState >= state.id ? 'font-medium text-primary' : 'text-gray-500'}
            `}
          >
            {state.label}
          </div>
          
          {/* Connection line between steps */}
          {index < states.length - 1 && (
            <div
              className={`absolute w-24 h-0.5 mt-6
                ${currentState > state.id ? 'bg-primary' : 'bg-gray-300'}
              `}
              style={{ marginLeft: '30px' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}