import React from 'react';
import AdminPageContainer from '../../components/admin/AdminPageContainer';
import { CostTrackingDashboard } from '../../components/cost-tracking/CostTrackingDashboard';

const CostsPage: React.FC = () => {
  return (
    <AdminPageContainer>
      <CostTrackingDashboard />
    </AdminPageContainer>
  );
};

export { CostsPage };