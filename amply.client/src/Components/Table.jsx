import React from "react";
import { Trash2, Edit2 } from "lucide-react";

export default function UiTable({ title, columns, data, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{data.length} records</p>
        </div>
      )}

      {/* Card List */}
      <div className="p-6 space-y-4">
        {data.length === 0 && (
          <p className="text-center text-gray-500 py-4">No data available</p>
        )}

        {data.map((row, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
          >
            {/* Left: Columns Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              {columns.map((col, cidx) => (
                <div key={cidx} className="flex flex-col">
                  <span className="text-xs text-gray-500">{col.header}</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </span>
                </div>
              ))}
            </div>

            {/* Right: Actions */}
            {(onEdit || onDelete) && (
              <div className="flex gap-2 mt-3 md:mt-0">
                {onEdit && (
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => onEdit(row)}
                  >
                    <Edit2 size={18} />
                  </button>
                )}
                {onDelete && (
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => onDelete(row)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
