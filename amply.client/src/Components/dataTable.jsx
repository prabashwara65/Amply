import React from "react";

export default function DataTable({
  columns = [],
  data = [],
  pageSize = 10,
  onEdit,
  onDelete,
  actions = true,
}) {
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Simple search filter
  const filtered = React.useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.accessor];
        return val !== undefined && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, query, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border border-gray-900 rounded px-3 py-1 max-w-sm focus:outline-none focus:ring focus:ring-gray-300 text-black"
          />
          <button
            className="px-3 py-1 border border-gray-500 rounded hover:bg-gray-900 bg-black"
            onClick={() => setQuery("")}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className="text-left px-4 py-2 border-b font-semibold text-gray-700"
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="text-left px-4 py-2 border-b font-semibold text-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.length > 0 ? (
              pageData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td
                      key={col.accessor}
                      className="px-4 py-2 border-b text-gray-600"
                    >
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-2 border-b">
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 text-sm border rounded bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => onEdit?.(row)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 text-sm border rounded bg-red-500 text-white hover:bg-red-600"
                          onClick={() => onDelete?.(row)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="text-center text-gray-500 py-6"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">
          Showing {(page - 1) * pageSize + 1} to{" "}
          {Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </span>
        <div className="flex items-center gap-2 text-gray-500">
          <button
            className="px-2 py-1 border rounded hover:bg-gray-900 bg-black text-white"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="px-2 text-sm">
            {page} / {totalPages}
          </span>
          <button
            className="px-2 py-1 border rounded hover:bg-gray-900 bg-black text-white"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
