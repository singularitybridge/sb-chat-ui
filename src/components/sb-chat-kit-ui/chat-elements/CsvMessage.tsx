import React, { useEffect, useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { FileMetadata } from '../../../types/chat';
import { formatFileSize } from '../../../utils/fileUtils';

interface CsvMessageProps {
  fileMetadata: FileMetadata;
  content: string; 
  role: string;
  createdAt: number;
}

const CsvMessage: React.FC<CsvMessageProps> = ({
  fileMetadata,
  content,
  role,
  createdAt,
}) => {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const PREVIEW_ROW_LIMIT = 5;

  const fetchAndParseCsv = async (url: string) => {
    setIsLoadingPreview(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }
      const text = await response.text();
      
      const allRows = text.split(/\r?\n/).filter(row => row.trim() !== '');
      setRowCount(allRows.length);

      if (allRows.length > 0) {
        const headerRow = allRows[0].split(',');
        setHeaders(headerRow.map(h => h.trim()));

        const dataRows = allRows
          .slice(1, PREVIEW_ROW_LIMIT + 1)
          .map(rowStr => rowStr.split(',').map(cell => cell.trim()));
        setCsvData(dataRows);
      }
    } catch (error) {
      console.error('Error fetching or parsing CSV:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (fileMetadata.url || fileMetadata.gcpStorageUrl) {
      fetchAndParseCsv(fileMetadata.url || fileMetadata.gcpStorageUrl || '');
    } else if (content) { // Fallback if content is the CSV text itself
      const allRows = content.split(/\r?\n/).filter(row => row.trim() !== '');
      setRowCount(allRows.length);
      if (allRows.length > 0) {
        const headerRow = allRows[0].split(',');
        setHeaders(headerRow.map(h => h.trim()));
        const dataRows = allRows
          .slice(1, PREVIEW_ROW_LIMIT + 1)
          .map(rowStr => rowStr.split(',').map(cell => cell.trim()));
        setCsvData(dataRows);
      }
    }
  }, [fileMetadata.url, fileMetadata.gcpStorageUrl, content]);

  const handleDownload = () => {
    if (fileMetadata.url || fileMetadata.gcpStorageUrl) {
      const link = document.createElement('a');
      link.href = fileMetadata.url || fileMetadata.gcpStorageUrl || '';
      link.download = fileMetadata.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUser = role === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-md md:max-w-lg lg:max-w-xl rounded-2xl shadow-sm ${
          isUser
            ? 'bg-background border border-border text-foreground rounded-bl-2xl'
            : 'bg-background border border-border text-foreground rounded-br-2xl'
        }`}
      >
        <div className="p-3">
          <div
            className={`
            rounded-lg p-3 sm:p-4 transition-colors 
            ${isUser ? 'bg-secondary' : 'bg-green-50'} 
          `}
          >
            <div className="flex flex-col space-y-2">
              {/* File Name and Info Row */}
              <div className="flex items-center justify-between">
                <div className="grow space-y-0.5">
                  <p className={`text-sm font-medium break-all ${
                    isUser ? 'text-foreground' : 'text-foreground'
                  }`}>
                    {fileMetadata.fileName}
                  </p>
                  <div className="flex items-center space-x-1.5 text-xs">
                    <FileSpreadsheet className={`w-4 h-4 ${isUser ? 'text-muted-foreground' : 'text-green-500'}`} strokeWidth={1.5} />
                    <span className={`
                      px-1.5 py-0.5 rounded-full font-medium text-xs
                      ${isUser ? 'bg-accent text-foreground' : 'bg-green-100 text-green-700'}
                    `}>
                      csv
                    </span>
                    <span className={isUser ? 'text-muted-foreground' : 'text-muted-foreground'}>
                      {formatFileSize(fileMetadata.fileSize)}
                    </span>
                    {isLoadingPreview && !rowCount && !csvData.length ? (
                        <span className="text-xs text-muted-foreground">Loading info...</span>
                    ) : rowCount > 0 ? (
                       <span className={isUser ? 'text-muted-foreground' : 'text-muted-foreground'}>
                         {rowCount} rows
                       </span>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  title="Download CSV"
                  className={`
                    p-1.5 rounded-md transition-colors ml-2 shrink-0
                    ${isUser
                      ? 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      : 'text-green-500 hover:bg-green-100 hover:text-green-700'
                    }
                  `}
                >
                  <Download className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              {/* CSV Table Preview Restored */}
              {isLoadingPreview && csvData.length === 0 && (
                <div className="text-center py-4">
                  <p className={`${isUser ? 'text-muted-foreground' : 'text-green-700'} text-sm`}>Loading preview...</p>
                </div>
              )}

              {!isLoadingPreview && csvData.length > 0 && (
                <div className="overflow-x-auto max-h-48 bg-background rounded-md shadow mt-2"> {/* Added mt-2 */}
                  <table className="min-w-full text-xs">
                    <thead className="sticky top-0 bg-secondary z-10">
                      <tr>
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-2 py-1.5 text-left font-medium text-muted-foreground whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-border">
                      {csvData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-2 py-1.5 text-foreground whitespace-nowrap"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rowCount > PREVIEW_ROW_LIMIT + 1 && ( // Ensure headers are not counted in "more rows"
                     <p className="text-center text-xs text-muted-foreground py-1 bg-secondary">
                       ... and {rowCount - (csvData.length + (headers.length > 0 ? 1: 0) )} more rows
                     </p> // Adjusted "more rows" calculation
                  )}
                </div>
              )}

              {!isLoadingPreview && csvData.length === 0 && headers.length === 0 && (fileMetadata.url || fileMetadata.gcpStorageUrl) && (
                <div className="text-center py-2"> {/* Reduced padding */}
                  <p className={`${isUser ? 'text-muted-foreground' : 'text-green-600'} text-xs`}>No preview available or file is empty.</p>
                </div>
              )}
              
            </div>
          </div>
        </div>
        
        {/* Content prop is not rendered separately */}
        <div className={`px-4 pt-0 pb-2 text-xs ${isUser ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
          {formatDate(createdAt)}
        </div>
      </div>
    </div>
  );
};

export { CsvMessage };
