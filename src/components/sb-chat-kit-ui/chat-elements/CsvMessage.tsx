import React, { useEffect, useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react'; // Added FileSpreadsheet from lucide-react
import { FileMetadata } from '../../../types/chat';
import { formatFileSize } from '../../../utils/fileUtils'; // Removed getFileIcon as we'll use Lucide directly

interface CsvMessageProps {
  fileMetadata: FileMetadata;
  content: string; // This might be empty if only metadata is passed
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
      
      // Basic CSV parsing (can be improved with a library if needed)
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
      // Handle error state, e.g., show a message
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (fileMetadata.url || fileMetadata.gcpStorageUrl) {
      fetchAndParseCsv(fileMetadata.url || fileMetadata.gcpStorageUrl || '');
    } else if (content) {
      // If content is directly provided (though less likely for large CSVs)
      // This part is simplified and assumes content is the CSV text
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
  // const fileIcon = getFileIcon(fileMetadata.mimeType); // We will use Lucide icon directly

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-md md:max-w-lg lg:max-w-xl rounded-2xl shadow-sm ${
          isUser
            ? 'bg-white border border-gray-200 text-gray-800 rounded-bl-2xl' // User messages now white with border
            : 'bg-white border border-gray-200 text-gray-800 rounded-br-2xl' // Assistant messages remain white with border
        }`}
      >
        <div className="p-4">
          <div // Removed border-dashed, adjusted padding and background
            className={`
            rounded-lg p-4 sm:p-6 transition-colors 
            ${isUser ? 'bg-gray-100' : 'bg-green-50'} 
          `}
          >
            <div className="flex flex-col space-y-3">
              {/* File Name and Info Row */}
              <div className="flex items-center justify-between"> {/* Main row for name, info, and download icon */}
                <div className="flex-grow space-y-0.5">
                  <p className={`text-sm font-medium break-all ${
                    isUser ? 'text-gray-800' : 'text-gray-800' 
                  }`}>
                    {fileMetadata.fileName}
                  </p>
                  <div className="flex items-center space-x-1.5 text-xs"> {/* Reduced space-x */}
                    <FileSpreadsheet className={`w-4 h-4 ${isUser ? 'text-gray-500' : 'text-green-500'}`} strokeWidth={1.5} />
                    <span className={`
                      px-1.5 py-0.5 rounded-full font-medium text-xs  /* Adjusted padding and font size */
                      ${isUser ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'}
                    `}>
                      csv
                    </span>
                    <span className={isUser ? 'text-gray-500' : 'text-gray-500'}>
                      {formatFileSize(fileMetadata.fileSize)}
                    </span>
                    {rowCount > 0 && (
                       <span className={isUser ? 'text-gray-500' : 'text-gray-500'}>
                         {rowCount} rows
                       </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  title="Download CSV"
                  className={`
                    p-1.5 rounded-md transition-colors ml-2 flex-shrink-0 /* Added margin-left */
                    ${isUser
                      ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700' 
                      : 'text-green-500 hover:bg-green-100 hover:text-green-700'
                    }
                  `}
                >
                  <Download className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              {isLoadingPreview && (
                <div className="text-center py-4">
                  <p className={`${isUser ? 'text-gray-600' : 'text-gray-600'} text-sm`}>Loading preview...</p>
                </div>
              )}

              {!isLoadingPreview && csvData.length > 0 && (
                <div className="overflow-x-auto max-h-48 bg-white rounded-md shadow">
                  <table className="min-w-full text-xs">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                      <tr>
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-2 py-1.5 text-left font-medium text-gray-500 whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {csvData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-2 py-1.5 text-gray-700 whitespace-nowrap"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rowCount > PREVIEW_ROW_LIMIT + 1 && (
                     <p className="text-center text-xs text-gray-500 py-1 bg-gray-50">
                       ... and {rowCount - (PREVIEW_ROW_LIMIT +1)} more rows
                     </p>
                  )}
                </div>
              )}

              {!isLoadingPreview && csvData.length === 0 && headers.length === 0 && !fileMetadata.url && !fileMetadata.gcpStorageUrl && (
                <div className="text-center py-4">
                  <p className={`${isUser ? 'text-gray-600' : 'text-gray-600'} text-sm`}>No preview available or file is empty.</p>
                </div>
              )}
              
              {/* Removed the full-width download button, it's now an icon button on the top right */}
            </div>
          </div>
        </div>

        {content && content.trim() && (
          <div className="px-4 pb-3">
            <p className={`text-sm ${isUser ? 'text-gray-700' : 'text-gray-800'}`}>
              {content}
            </p>
          </div>
        )}

        <div className={`px-4 py-2 text-xs ${isUser ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatDate(createdAt)}
        </div>
      </div>
    </div>
  );
};

export { CsvMessage };
