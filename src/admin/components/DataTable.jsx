export default function DataTable({ columns, data, keyField = "id", loading, emptyMessage = "No data found", skeletonRows = 5 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`pb-3 font-medium ${col.align === "right" ? "text-right" : ""} ${col.className || ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="py-3">
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-stone-400 dark:text-stone-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[keyField]} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`py-3 ${col.align === "right" ? "text-right" : ""} ${col.className || ""}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
