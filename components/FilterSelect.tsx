'use client';

import { type ChangeEvent, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

/** 수능·논술 목록 필터 등에서 공통으로 쓰는 셀렉트 스타일 */
export const filterSelectClass =
  'min-h-[44px] w-full cursor-pointer appearance-none rounded-xl bg-white py-2.5 pl-4 pr-10 text-base font-medium text-slate-800 shadow-[inset_0_0_0_1px_rgb(226_232_240/0.95)] transition-[box-shadow,background-color] hover:shadow-[inset_0_0_0_1px_rgb(203_213_225/0.9)] focus:outline-none focus:shadow-[inset_0_0_0_2px_rgb(99_102_241/0.35)] sm:text-sm dark:bg-slate-950 dark:text-slate-100 dark:shadow-[inset_0_0_0_1px_rgb(51_65_85/0.85)] dark:hover:shadow-[inset_0_0_0_1px_rgb(71_85_105/0.9)] dark:focus:shadow-[inset_0_0_0_2px_rgb(129_140_248/0.35)]';

export function FilterSelect({
  id,
  label,
  value,
  onChange,
  className,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  /** 바깥 래퍼 (너비 제한 등) */
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className ? `space-y-2 ${className}` : 'space-y-2'}>
      <label
        htmlFor={id}
        className="block text-xs font-semibold tracking-tight text-slate-600 dark:text-slate-400"
      >
        {label}
      </label>
      <div className="relative">
        <select id={id} value={value} onChange={onChange} className={filterSelectClass}>
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 opacity-80 dark:text-slate-500"
          aria-hidden
        />
      </div>
    </div>
  );
}
