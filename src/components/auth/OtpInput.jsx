import React, { useRef } from 'react';

export default function OtpInput({ value, onChange, length = 6 }) {
  const inputs = useRef([]);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const arr  = value.split('');
    arr[idx]   = val;
    onChange(arr.join(''));
    if (val && idx < length - 1) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0)
      inputs.current[idx - 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(text.padEnd(length, '').slice(0, length));
    inputs.current[Math.min(text.length, length - 1)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center my-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className="otp-input"
        />
      ))}
    </div>
  );
}
