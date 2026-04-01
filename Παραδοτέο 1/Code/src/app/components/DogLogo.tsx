import logoImage from 'figma:asset/98247a7d350b4a01d57c6e282e924103172c353a.png';

export function DogLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <img 
      src={logoImage} 
      alt="SkillUs Logo" 
      className={className}
    />
  );
}