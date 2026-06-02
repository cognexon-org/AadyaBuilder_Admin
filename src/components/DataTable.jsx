import { EmptyState, Loading } from './Loading';
import { getId } from '../utils/formatters';

export default function DataTable({ columns, rows = [], loading, emptyTitle, emptyDescription, rowKey = getId }) {
  if (loading) return <Loading />;
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key || column.header} className="table-th">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, rowIndex) => (
              <tr key={rowKey(row) || rowIndex} className="hover:bg-slate-50/80">
                {columns.map((column) => (
                  <td key={column.key || column.header} className="table-td">
                    {column.render ? column.render(row, rowIndex) : row[column.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
