import React from 'react';

export default function OrderTimeline({ steps }) {
  return (
    <div className="flex flex-col space-y-4">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div key={index} className="flex relative">
            {!isLast && (
              <div 
                className={`absolute left-2.5 top-6 bottom-0 w-0.5 -ml-px ${step.done ? 'bg-brand-500' : 'bg-gray-200'}`} 
                aria-hidden="true" 
              />
            )}
            
            <div className="relative flex items-center justify-center flex-shrink-0 w-5 h-5 mt-1 mr-3">
              <div 
                className={`w-3 h-3 rounded-full ${
                  step.active ? 'bg-brand-500 ring-4 ring-brand-100' 
                  : step.done ? 'bg-brand-500' 
                  : 'bg-gray-300'
                }`} 
              />
            </div>
            
            <div className={`flex flex-col min-w-0 pb-4 ${!step.done && !step.active ? 'opacity-50' : ''}`}>
              <p className="text-sm font-semibold text-gray-900">{step.label}</p>
              {step.time && <p className="text-xs text-gray-500 mt-0.5">{step.time}</p>}
              {step.note && <p className="text-sm text-gray-600 mt-1">{step.note}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
