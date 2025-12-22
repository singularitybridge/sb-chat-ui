import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { IAssistant } from '../types/entities';

interface UseFuzzySearchOptions {
  threshold?: number;
  keys?: string[];
}

export const useFuzzySearch = (
  items: IAssistant[],
  options: UseFuzzySearchOptions = {}
) => {
  const { threshold = 0.3, keys = ['name', 'description', 'llmModel'] } = options;
  const [searchQuery, setSearchQuery] = useState('');

  // Create Fuse instance with memoization
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: [
          { name: 'name', weight: 0.7 },
          { name: 'description', weight: 0.2 },
          { name: 'llmModel', weight: 0.1 },
        ],
        threshold,
        includeScore: true,
        ignoreLocation: true,
        useExtendedSearch: false,
      }),
    [items, threshold]
  );

  // Perform search
  const results = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const fuseResults = fuse.search(searchQuery);
    return fuseResults.map((result) => result.item);
  }, [searchQuery, fuse, items]);

  return {
    results,
    searchQuery,
    setSearchQuery,
  };
};
