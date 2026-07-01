'use client';

export function Toggle({ 
  checked, 
  onChange, 
  label 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <label className="flex items-center cursor-pointer">
      <div 
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-[#D4A017]' : 'bg-[#2A2A2A]'
        }`}
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
      >
        <span 
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </div>
      {label && <span className="ml-3 text-sm text-[#F5F5F5]">{label}</span>}
    </label>
  );
}
