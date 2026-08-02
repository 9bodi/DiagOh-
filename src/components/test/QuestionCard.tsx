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
        <div className="ohe-eyebrow text-ohe-accent mb-4">
          {subCategory}
        </div>
      )}

      {instruction && (
        <p className="text-[15px] text-ohe-muted mb-6 leading-relaxed">
          {instruction}
        </p>
      )}

      {questionText && questionText.trim() !== '' && (
  <div className="mb-5 pb-5 border-b border-ohe-line-soft">
    <p className="font-serif text-[22px] sm:text-[28px] text-ohe-ink leading-[1.2] tracking-[-0.01em]">

            « {questionText} »
          </p>
        </div>
      )}

<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={index}
              type="button"
              onClick={() => !disabled && onSelect(index)}
              disabled={disabled}
              className={`
  group flex items-center gap-3 px-4 py-3 rounded-2xl border text-left

                transition-all duration-150
                ${
                  isSelected
                    ? 'border-ohe-accent bg-ohe-accent-soft'
                    : 'border-ohe-line bg-ohe-panel hover:border-ohe-ink/40 hover:bg-ohe-panel-tint'
                }
                ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                focus:outline-none focus-visible:ring-2 focus-visible:ring-ohe-accent-soft focus-visible:border-ohe-accent
              `}
            >
              <span
                className={`
                  shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  font-serif italic text-[15px]
                  transition-colors duration-150
                  ${
                    isSelected
                      ? 'bg-ohe-accent text-ohe-accent-ink border-transparent'
                      : 'bg-transparent text-ohe-muted border border-ohe-line group-hover:text-ohe-ink group-hover:border-ohe-ink/40'
                  }
                `}
              >
                {LETTERS[index]}
              </span>
              <span
                className={`text-[15px] sm:text-base flex-1 leading-snug ${
                  isSelected ? 'text-ohe-ink font-medium' : 'text-ohe-ink'
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
