export function DogLogo({ className = "w-10 h-10" }: { className?: string }) {
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