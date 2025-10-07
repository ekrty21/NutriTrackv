
import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, max, unit }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOver = value > max;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className={`text-sm font-medium ${isOver ? 'text-red-500' : 'text-text-secondary'}`}>
          {Math.round(value)} / {max} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${isOver ? 'bg-red-500' : 'bg-primary'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
