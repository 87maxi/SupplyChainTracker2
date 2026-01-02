'use client';

import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  completed: boolean;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: string;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {steps.map((step, index) => {
        const isCompleted = step.completed;
        const isCurrent = step.id === currentStep;
        const isPast = steps.findIndex(s => s.id === step.id) < steps.findIndex(s => s.id === currentStep);
        
        return (
          <div key={step.id} className="flex items-center w-full sm:w-auto">
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2",
                isCompleted || isPast ? "bg-primary border-primary" : 
                isCurrent ? "border-primary bg-background" : "border-muted bg-background"
              )}>
                {isCompleted || isPast ? (
                  <Check className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <span className={cn(
                    "text-xs font-medium",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                )}
              </div>
            </div>
            
            <div className="ml-3 flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium truncate",
                isCompleted || isPast ? "text-primary" : 
                isCurrent ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </p>
            </div>
            
            {index < steps.length - 1 && (
              <div className="hidden sm:block flex-1 mx-4">
                <div className={cn(
                  "h-0.5 w-full",
                  isPast ? "bg-primary" : "bg-muted"
                )} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}