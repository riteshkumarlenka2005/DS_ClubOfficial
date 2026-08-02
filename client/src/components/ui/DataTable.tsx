interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-[#E0D4F5]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E0D4F5] bg-[#EEEAFD]/40">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-[#4B2C82]/70 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E0D4F5]/30">
          {data.map((item) => (
            <tr
              key={item[keyField]}
              onClick={() => onRowClick?.(item)}
              className={`hover:bg-[#EEEAFD]/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-[#2D164B]/80 ${col.className || ''}`}
                >
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
