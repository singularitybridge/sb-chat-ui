import React from 'react';
import { useTranslation } from 'react-i18next';
import { TextComponent } from './TextComponent';

interface TableProps {
  headers: string[];
  Page: string;
  data: { [key: string]: any }[];
  onRowClick?: (row: any) => void;
  Actions?: (row: any) => JSX.Element;
}

const Table: React.FC<TableProps> = ({
  headers,
  Page,
  data,
  onRowClick,
  Actions,
}) => {
  const renderCellContent = (value: any) => {
    if (typeof value === 'boolean') {
      return value.toString();
    }
    return value;
  };

  const { t } = useTranslation();

  return (
    <div className="flex flex-col w-full">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr>
                  {headers.map((row, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-6 py-4 max-w-xs truncate rtl:text-right ltr:text-left"
                    >
                      <TextComponent
                        text={t(`${Page}.table.${row}`)}
                        size="normal"
                        color="info"
                      />
                    </th>
                  ))}
                  {Actions && (
                    <th
                      scope="col"
                      className="px-6 py-4 max-w-xs truncate rtl:text-right ltr:text-left"
                    >
                      <TextComponent
                        text={t('common.actions')}
                        size="normal"
                        color="info"
                      />
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-zinc-100 hover:bg-neutral-50"
                    onClick={() => onRowClick?.(row)}
                  >
                    {headers.map((header, headerIndex) => (
                      <td
                        key={headerIndex}
                        className={`px-6 py-4 truncate ${
                          header === 'specificColumn' ? 'max-w-md' : 'max-w-xs'
                        }`}
                      >
                        <TextComponent size='small' color='normal' text={renderCellContent(t(row[header]))} />
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