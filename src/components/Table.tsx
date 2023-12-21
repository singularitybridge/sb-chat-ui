import React from 'react';

interface TableProps {
  headers: string[];
  data: { [key: string]: any }[];
}

const Table: React.FC<TableProps> = ({ headers, data }) => {
  return (
    <div className="flex flex-col w-full">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <table className="min-w-full text-left text-sm font-light">
              <thead className="border-b font-medium dark:border-neutral-500">
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} scope="col" className="px-6 py-4">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b dark:border-neutral-500">
                    {headers.map((header, headerIndex) => (
                      <td key={headerIndex} className="whitespace-nowrap px-6 py-4">
                        {row[header]}
                      </td>
                    ))}
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
