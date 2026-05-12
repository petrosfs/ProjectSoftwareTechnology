import { useState } from 'react';

export function DogLogo({ className = "w-10 h-10" }: { className?: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={
          className +
          " inline-flex items-center justify-center rounded-full bg-slate-950 text-white font-semibold text-sm"
        }
        aria-label="SkillUs logo"
      >
        SU
      </div>
    );
  }

  return (
    <img
      src="/skillus-logo.png"
      alt="SkillUs logo"
      className={className + ' rounded-full object-cover'}
      onError={() => setHasError(true)}
    />
  );
}