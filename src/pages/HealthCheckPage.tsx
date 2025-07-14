import React from 'react';
import packageJson from '../../package.json';

const HealthCheckPage: React.FC = () => {
  const healthData = {
    status: 'ok',
    version: packageJson.version,
    name: packageJson.name,
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Health Check</h1>
      <pre className="bg-gray-100 p-4 rounded-lg font-mono text-sm overflow-auto">
        {JSON.stringify(healthData, null, 2)}
      </pre>
    </div>
  );
};

export default HealthCheckPage;
