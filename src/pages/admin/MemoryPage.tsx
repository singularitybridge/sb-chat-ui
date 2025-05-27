import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { BookText, Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
// import { useNavigate } from 'react-router-dom'; // Not used currently
// import { motion, AnimatePresence } from 'framer-motion'; // Not used currently

import { useMemoryStore } from '../../store/useMemoryStore';
import { useAuthStore } from '../../store/useAuthStore'; // Added import for useAuthStore
import { IJournalEntry } from '../../store/models/JournalEntry';
import { SearchInput } from '../../components/SearchInput'; // Changed to named import

const MemoryPage: React.FC = observer(() => {
  const {
    entries,
    isLoading,
    error,
    filters,
    loadEntries,
    setFilters,
    clearError,
  } = useMemoryStore();
  const { isUserDataLoaded } = useAuthStore(); 
  
  // const navigate = useNavigate(); // Keep for future actions
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm || '');
  const { t } = useTranslation();

  // console.log('[MemoryPage] Rendering, isUserDataLoaded:', isUserDataLoaded); // DEBUG LOG Removed

  useEffect(() => {
    // console.log('[MemoryPage] Initial load useEffect triggered. isUserDataLoaded:', isUserDataLoaded); // DEBUG LOG Removed
    if (isUserDataLoaded) { 
      // console.log('[MemoryPage] User data loaded, calling loadEntries.'); // DEBUG LOG Removed
      loadEntries({ searchTerm: filters.searchTerm });
    } else {
      // console.log('[MemoryPage] User data NOT loaded, not calling loadEntries yet.'); // DEBUG LOG Removed
    }
  }, [loadEntries, filters.searchTerm, isUserDataLoaded]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      // Ensure user data is loaded before attempting a debounced search that calls loadEntries
      if (isUserDataLoaded && localSearchTerm !== (filters.searchTerm || '')) { // Only search if term changed and user data loaded
        setFilters({ searchTerm: localSearchTerm });
        loadEntries({ searchTerm: localSearchTerm });
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchTerm, loadEntries, setFilters, filters.searchTerm, isUserDataLoaded]); // Add isUserDataLoaded
  
  const handleLocalSearchChange = (newTerm: string) => {
    setLocalSearchTerm(newTerm);
  };

  const handleFilterChange = (filterName: keyof typeof filters, value: any) => {
    setFilters({ [filterName]: value });
    loadEntries({ [filterName]: value });
  };

  const handleEntryTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEntryType = event.target.value;
    setFilters({ entryType: newEntryType === '' ? undefined : newEntryType });
    // Debounce or handle loadEntries separately if needed, for now direct load
    loadEntries({ entryType: newEntryType === '' ? undefined : newEntryType });
  };
  
  // Placeholder for item click, edit, delete - to be implemented later
  const handleItemClick = (itemId: string) => {
    console.log('View item:', itemId);
    // navigate(`/admin/memory/${itemId}`);
  };

  const renderEntryTypeFilter = () => (
    <input
      type="text"
      value={filters.entryType || ''}
      onChange={handleEntryTypeChange}
      placeholder={t('MemoryPage.filterByTypePlaceholder') || 'Filter by type...'}
      className="p-2 border rounded-md bg-white text-sm w-40" // Added w-40 for consistent width
    />
  );

  const renderScopeFilter = () => (
    <select
      value={filters.scope || 'user'}
      onChange={(e) => handleFilterChange('scope', e.target.value as 'user' | 'company')}
      className="p-2 border rounded-md bg-white text-sm"
    >
      <option value="user">My Entries</option>
      <option value="company">Company Entries</option>
    </select>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <TextComponent text={t('MemoryPage.errorLoading') || 'Error loading entries'} size="subtitle" />
        <p className="text-sm">{error}</p>
        <button 
          onClick={() => { clearError(); loadEntries(); }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {t('MemoryPage.tryAgain') || 'Try Again'}
        </button>
      </div>
    );
  }
  // Removed extra closing brace here

  return (
    <div className="flex justify-center h-full">
      <div className="flex w-full max-w-7xl">
        <div className="flex flex-col rounded-lg max-w-4xl w-full mx-auto"> {/* Adjusted max-width for potentially wider cards */}
          <div className="flex flex-row justify-between items-center w-full mb-6">
            <TextComponent text={t('MemoryPage.title') || 'Memory Journal'} size="subtitle" />
            {/* Add button can be re-enabled later */}
          </div>

          <div className="mb-6 flex space-x-4 items-center">
            <SearchInput 
              value={localSearchTerm}
              onChange={handleLocalSearchChange}
              placeholder={t('MemoryPage.searchPlaceholder') || 'Search entries...'} 
              // className="flex-grow" // SearchInput already has w-full
            />
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              {renderEntryTypeFilter()}
              {renderScopeFilter()}
            </div>
          </div>
          
          {isLoading && entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              <TextComponent text={t('MemoryPage.loading') || 'Loading entries...'} size="normal" className="mt-4" />
            </div>
          ) : (
            <ul className="space-y-4 flex-grow overflow-y-auto pr-2 rtl:pl-2 rtl:pr-0 pb-6">
              {entries.map((item: IJournalEntry) => {
                return (
                  <li
                    key={item._id}
                    className="group rounded-lg p-4 cursor-pointer hover:bg-blue-100 relative bg-white shadow"
                    onClick={() => handleItemClick(item._id)}
                    onMouseEnter={() => setHoveredItemId(item._id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-start space-x-3 rtl:space-x-reverse">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full">
                             <BookText className="w-5 h-5 text-slate-600" />
                          </div>
                        </div>
                        <div className="flex-grow min-w-0 flex flex-col">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-md text-slate-800 truncate">
                              {/* Displaying content snippet as title if no specific title field */}
                              {item.content.substring(0, 50)}{item.content.length > 50 ? '...' : ''}
                            </h4>
                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                              {item.friendlyTimestamp || new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                            {item.content}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full">{item.entryType}</span>
                              {item.userName && <span className="text-xs text-gray-500">by {item.userName}</span>}
                            </div>
                            {/* Action buttons (edit, delete) can be added here, visible on hover */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
              {!isLoading && entries.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <Filter className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>{t('MemoryPage.noItems') || 'No journal entries found for the current filters.'}</p>
                  <p className="mt-1 text-sm">
                    {t('MemoryPage.tryAdjustingFilters') || 'Try adjusting your search or filters.'}
                  </p>
                </div>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
});

export { MemoryPage };
