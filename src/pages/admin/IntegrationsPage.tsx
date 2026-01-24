import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntegrationStore } from '../../store/useIntegrationStore';
import { IntegrationCard } from '../../components/integrations/IntegrationCard';
import { Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const IntegrationsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    integrationsLoaded,
    isLoading,
    loadIntegrations,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    getFilteredIntegrations,
    getCategories,
  } = useIntegrationStore();

  useEffect(() => {
    if (!integrationsLoaded) {
      loadIntegrations();
    }
  }, [integrationsLoaded, loadIntegrations]);

  const filteredIntegrations = getFilteredIntegrations();
  const categories = getCategories();

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full bg-card rounded-2xl flex flex-col h-full overflow-hidden">
        {/* Header with title and filters on same row */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Title and subtitle */}
            <div>
              <h1 className="text-2xl font-semibold">
                {t('integrations.title', 'Integrations')}
              </h1>
              <p className="text-muted-foreground mt-0.5">
                {t(
                  'integrations.subtitle',
                  'Configure API keys and settings for your integrations'
                )}
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('integrations.search', 'Search integrations...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={selectedCategory || 'all'}
                onValueChange={(value) =>
                  setSelectedCategory(value === 'all' ? null : value)
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue
                    placeholder={t('integrations.allCategories', 'All Categories')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('integrations.allCategories', 'All Categories')}
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatCategory(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {isLoading && !integrationsLoaded ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredIntegrations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t('integrations.noResults', 'No integrations found')}</p>
              {searchQuery && (
                <p className="mt-2 text-sm">
                  {t(
                    'integrations.clearSearch',
                    'Try clearing your search or changing filters'
                  )}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { IntegrationsPage };
