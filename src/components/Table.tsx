import React, { useEffect } from 'react';

interface TableProps {
  headers: string[];
  data: { [key: string]: any }[];
  onRowClick?: (row: any) => void;
  Actions?: (row: any) => JSX.Element; // Add this line
}

const Table: React.FC<TableProps> = ({
  headers,
  data,
  onRowClick,
  Actions,
}) => {
  useEffect(() => {
    console.log(data);
  }, []);

  const renderCellContent = (value: any) => {
    if (typeof value === 'boolean') {
      return value.toString();
    }
    return value;
  };

  return (
    <div className="flex flex-col w-full">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <table className="min-w-full text-left text-sm font-light">
              <thead className="border-b font-medium dark:border-neutral-500">
                <tr>
                  {headers.map((row, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-6 py-4 max-w-xs truncate"
                      

                    >
                      {row}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b dark:border-neutral-500 transition duration-300 ease-in-out hover:bg-neutral-100 dark:hover:bg-neutral-600"
                    onClick={() => onRowClick?.(row)}
                  >
                    {headers.map((header, headerIndex) => (
                      <td
                        key={headerIndex}
                        className={`px-6 py-4 truncate ${
                          header === 'specificColumn' ? 'max-w-md' : 'max-w-xs'
                        }`}
                      >
                        {renderCellContent(row[header])}
                      </td>
                    ))}
                    {Actions && <td className="px-6 py-4">{Actions(row)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Table };
