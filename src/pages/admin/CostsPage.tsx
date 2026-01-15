import React from 'react';
import { PageLayout } from '../../components/admin/PageLayout';
import { CostTrackingDashboard } from '../../components/cost-tracking/CostTrackingDashboard';

const CostsPage: React.FC = () => {
  return (
    <PageLayout variant="card">
      <CostTrackingDashboard />
    </PageLayout>
  );
};

export { CostsPage };
