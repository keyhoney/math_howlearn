/**
 * Google AdSense 등 디스플레이 광고 삽입을 위한 자리 확보용 영역입니다.
 * 승인 후 이 컴포넌트 내부에 adsbygoogle 스니펫을 넣거나 자식으로 교체하면 됩니다.
 */
const variantStyles = {
  /** 가로형(리더보드·반응형 상단 등) */
  banner:
    'min-h-[90px] sm:min-h-[100px] w-full max-w-[728px] mx-auto',
  /** 본문 중간·목록 사이용 중형 */
  inline:
    'min-h-[250px] w-full max-w-[336px] sm:max-w-[728px] mx-auto',
};

type AdPlaceholderProps = {
  variant?: keyof typeof variantStyles;
  /** 추후 스크립트·스타일에서 슬롯을 구분할 때 사용 (예: data-ad-region) */
  region: string;
  className?: string;
};

export function AdPlaceholder({
  variant = 'banner',
  region,
  className = '',
}: AdPlaceholderProps) {
  return (
    <aside
      aria-label="광고"
      data-ad-region={region}
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/90 bg-slate-50/80 px-4 py-6 text-center shadow-inner dark:border-slate-700/90 dark:bg-slate-900/50 ${variantStyles[variant]} ${className}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        광고
      </span>
      <span className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        Google AdSense 게재 예정 영역
      </span>
    </aside>
  );
}
