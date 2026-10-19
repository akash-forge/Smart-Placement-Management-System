/**
 * Animated placeholder rows shown while a table's data is loading, instead
 * of either a plain "Loading..." line or (worse) nothing at all — a table
 * that renders empty for a moment while data is in flight is visually
 * identical to "no data exists", which is misleading on a slow connection.
 *
 * Usage: keep the real <table>/<thead> mounted at all times, and swap only
 * the <tbody> contents between <TableSkeletonRows />, the real rows, and an
 * empty-state row.
 */
export default function TableSkeletonRows({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="animate-pulse">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <div
                className="h-4 rounded bg-gray-200 dark:bg-white/[0.06]"
                style={{ width: colIndex === 0 ? "2.5rem" : `${60 + ((rowIndex + colIndex) % 4) * 10}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
