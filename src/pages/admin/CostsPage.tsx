import React from 'react';
import { useTranslation } from 'react-i18next';
import { CostTrackingDashboard } from '../../components/cost-tracking/CostTrackingDashboard';

const CostsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full bg-card rounded-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border/50">
          <h1 className="text-2xl font-semibold">{t('costTracking.title')}</h1>
          <p className="text-muted-foreground mt-0.5">{t('costTracking.subtitle')}</p>
        </div>

        {/* CostTrackingDashboard handles its own scrolling and sticky footer */}
        <CostTrackingDashboard className="flex-1 min-h-0 px-6 pt-6" />
      </div>
    </div>
  );
};

export { CostsPage };
