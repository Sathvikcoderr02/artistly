import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onAction?: (item: T) => void;
  actionLabel?: string;
}

export function DataTable<T>({
  data,
  columns,
  onAction,
  actionLabel = 'Action',
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
            {onAction && <TableHead className="w-[100px]">{actionLabel}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <TableCell key={colIndex}>
                    {typeof column.accessor === 'function'
                      ? column.accessor(item)
                      : String(item[column.accessor as keyof T] || '')}
                  </TableCell>
                ))}
                {onAction && (
                  <TableCell>
                    <button
                      onClick={() => onAction(item)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </button>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (onAction ? 1 : 0)} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
