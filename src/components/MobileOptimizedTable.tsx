'use client';

import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Column<T> {
  header: string;
  accessor: (item: T) => ReactNode;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

interface MobileOptimizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => ReactNode;
  emptyMessage?: string;
  itemKey: (item: T) => string | number;
}

export function MobileOptimizedTable<T>({
  data,
  columns,
  onRowClick,
  actions,
  emptyMessage = 'No data found',
  itemKey,
}: MobileOptimizedTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="block lg:hidden space-y-3">
        {data.map((item) => (
          <Card
            key={itemKey(item)}
            className={onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
            onClick={() => onRowClick?.(item)}
          >
            <CardContent className="p-4">
              <div className="space-y-2">
                {columns
                  .filter((col) => !col.hideOnMobile)
                  .map((col, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-500 min-w-[100px]">
                        {col.mobileLabel || col.header}:
                      </span>
                      <span className="text-sm text-right flex-1 ml-2 font-medium">
                        {col.accessor(item)}
                      </span>
                    </div>
                  ))}
              </div>
              {actions && (
                <div className="mt-4 pt-3 border-t flex gap-2 justify-end">
                  {actions(item)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={itemKey(item)}
                className={`border-b hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className="px-4 py-3 text-sm">
                    {col.accessor(item)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

