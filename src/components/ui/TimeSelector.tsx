'use client';

import { useState, useEffect } from 'react';
import { FiClock, FiChevronUp, FiChevronDown } from 'react-icons/fi';

interface TimeSelectorProps {
  label: string;
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
  minTime?: string;
}

export function TimeSelector({ label, value, onChange, disabled = false, minTime }: TimeSelectorProps) {
  const [hours, setHours] = useState('08');
  const [minutes, setMinutes] = useState('00');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h);
      setMinutes(m);
    }
  }, [value]);

  const updateTime = () => {
    const timeString = `${hours}:${minutes}`;
    if (timeString !== value) {
      onChange(timeString);
    }
  };

  const adjustHours = (increment: boolean) => {
    const currentHour = parseInt(hours);
    let newHour = increment ? currentHour + 1 : currentHour - 1;
    
    if (newHour > 23) newHour = 0;
    if (newHour < 0) newHour = 23;
    
    const newHourString = newHour.toString().padStart(2, '0');
    setHours(newHourString);
    onChange(`${newHourString}:${minutes}`);
  };

  const adjustMinutes = (increment: boolean) => {
    const currentMinute = parseInt(minutes);
    let newMinute = increment ? currentMinute + 15 : currentMinute - 15;
    let newHour = parseInt(hours);
    
    if (newMinute >= 60) {
      newMinute = 0;
      newHour = newHour + 1;
      if (newHour > 23) newHour = 0;
    }
    if (newMinute < 0) {
      newMinute = 45;
      newHour = newHour - 1;
      if (newHour < 0) newHour = 23;
    }
    
    const newHourString = newHour.toString().padStart(2, '0');
    const newMinuteString = newMinute.toString().padStart(2, '0');
    
    setHours(newHourString);
    setMinutes(newMinuteString);
    onChange(`${newHourString}:${newMinuteString}`);
  };

  return (
    <div className={`${disabled ? 'opacity-50' : ''}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <FiClock className="inline mr-1" />
        {label}
      </label>
      <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-3">
        {/* Horas */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => !disabled && adjustHours(true)}
            disabled={disabled}
            className="text-orange-500 hover:text-orange-600 disabled:text-gray-300"
          >
            <FiChevronUp size={16} />
          </button>
          <div className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">
            {hours}
          </div>
          <button
            type="button"
            onClick={() => !disabled && adjustHours(false)}
            disabled={disabled}
            className="text-orange-500 hover:text-orange-600 disabled:text-gray-300"
          >
            <FiChevronDown size={16} />
          </button>
        </div>

        <div className="text-2xl font-bold text-gray-400">:</div>

        {/* Minutos */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => !disabled && adjustMinutes(true)}
            disabled={disabled}
            className="text-orange-500 hover:text-orange-600 disabled:text-gray-300"
          >
            <FiChevronUp size={16} />
          </button>
          <div className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">
            {minutes}
          </div>
          <button
            type="button"
            onClick={() => !disabled && adjustMinutes(false)}
            disabled={disabled}
            className="text-orange-500 hover:text-orange-600 disabled:text-gray-300"
          >
            <FiChevronDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}