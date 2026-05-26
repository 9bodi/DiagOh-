'use client';

interface QuestionCardProps {
  subCategory?: string | null;
  instruction?: string | null;
  questionText: string;
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export default function QuestionCard({
  subCategory,
  instruction,
  questionText,
  options,
  selectedIndex,
  onSelect,
  disabled = false,
}: QuestionCardProps) {
  return (
    <div className="w-full">
      {subCategory && (
        <p className="font-mono text-[11px] font-medium tracking-[0.16em] uppercase text-ohe-orange mb-4">
          {subCategory}
        </p>
      )}

      {instruction && (
        <p className="text-[15px] text-ohe-slate-600 mb-5">
          {instruction}
        </p>
      )}

      <div className="px-7 py-6 bg-ohe-slate-50 border border-ohe-slate-200/60 rounded-2xl mb-7">
        <p className="font-serif italic text-2xl md:text-[28px] text-ohe-slate-900 leading-snug">
          « {questionText} »
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => !disabled && onSelect(index)}
              disabled={disabled}
              className={`
                flex items-center gap-3.5 px-4 py-3.5 rounded-xl border text-left
                transition-all duration-150
                ${
                  isSelected
                    ? 'border-ohe-blue bg-ohe-blue/[0.06] border-[1.5px]'
                    : 'border-ohe-slate-200 bg-white hover:border-ohe-slate-400 hover:bg-ohe-slate-50/60 border-[1.5px]'
                }
                ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                focus:outline-none focus-visible:ring-2 focus-visible:ring-ohe-blue/30
              `}
            >
              <span
                className={`
                  flex-shrink-0 w-[26px] h-[26px] rounded-md flex items-center justify-center text-xs font-bold
                  transition-colors duration-150
                  ${
                    isSelected
                      ? 'bg-ohe-blue text-white'
                      : 'bg-ohe-slate-100 text-ohe-slate-600'
                  }
                `}
              >
                {LETTERS[index]}
              </span>
              <span
                className={`text-base flex-1 ${
                  isSelected ? 'font-semibold text-ohe-slate-900' : 'font-medium text-ohe-slate-900'
                }`}
              >
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}