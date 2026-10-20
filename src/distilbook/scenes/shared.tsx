/**
 * مشتركات مشاهد Distilbook — شعار القطرة وإزاحات الشرارات
 */

/** إزاحات الشرارات [dx, dy] — تُقرأ من data attributes في الخط الزمني */
export const SPARK_OFFSETS: Array<[number, number]> = [
  [-130, -60], [120, -80], [-90, 70], [110, 55], [-150, 10],
  [150, -15], [-60, -95], [65, 90], [-15, 110], [20, -110],
];

/** شعار القطرة — رمز «التقطير» في هوية Distilbook */
export function DropMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="db-drop" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5eead4" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.2C12 2.2 5 10 5 14.6a7 7 0 0 0 14 0C19 10 12 2.2 12 2.2Z"
        fill="url(#db-drop)"
      />
      <circle cx="9.6" cy="15.4" r="1.7" fill="#f0fdfa" opacity="0.85" />
    </svg>
  );
}
