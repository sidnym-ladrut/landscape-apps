import React from 'react';
import LeapOption from './LeapOption';

export default function LeapRow({
  option,
  selected,
}: {
  option: LeapOption;
  selected: boolean;
}) {
  const { icon, title, subtitle, onSelect } = option;
  return (
    <div
      onClick={onSelect}
      className={`${
        selected ? 'bg-gray-100' : ''
      } flex cursor-pointer items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <div className="shrink-0">{icon}</div>
          <div>
            <p className="text-sm font-medium text-gray-900">{title}</p>
          </div>
        </div>
        <div className="ml-4 shrink-0">{subtitle}</div>
      </div>
    </div>
  );
}
