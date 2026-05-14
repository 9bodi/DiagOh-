'use client';

interface QuestionCardProps {
  subCategory?: string | null;
  questionText: string;
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled?: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export default function QuestionCard({
  subCategory,
  questionText,
  options,
  selectedIndex,
  onSelect,
  disabled = false,
}: QuestionCardProps) {
  return (
    <div className="w-full">
      {subCategory && (
        <p className="text-xs font-semibold tracking-wider text-ohe-slate-600 uppercase mb-4">
          {subCategory}
        </p>
      )}

      <h2 className="text-xl sm:text-2xl font-semibold text-ohe-slate-900 mb-2">
        Complétez la phrase :
      </h2>

      <div className="p-5 bg-ohe-slate-50 border border-ohe-slate-200 rounded-xl mb-8">
        <p className="text-lg text-ohe-slate-900 leading-relaxed">{questionText}</p>
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
                flex items-center gap-3 p-4 rounded-lg border-2 text-left
                transition-all duration-150
                ${
                  isSelected
                    ? 'border-ohe-blue bg-ohe-blue/5 ring-2 ring-ohe-blue/20'
                    : 'border-ohe-slate-200 bg-white hover:border-ohe-slate-400 hover:bg-ohe-slate-50'
                }
                ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
              `}
            >
              <span
                className={`
                  flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold
                  ${
                    isSelected
                      ? 'bg-ohe-blue text-white'
                      : 'bg-ohe-slate-100 text-ohe-slate-600'
                  }
                `}
              >
                {LETTERS[index]}
              </span>
              <span className="text-sm font-medium text-ohe-slate-900 flex-1">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
