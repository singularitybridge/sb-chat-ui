import React from 'react';

interface TestItem {
  title: string;
  description: string;
  method?: string; // e.g., "POST", "GET"
  endpoint?: string;
  status?: 'pending' | 'passed' | 'failed' | 'running';
}

interface TestListProps {
  tests?: TestItem[] | string; // Accept both array and JSON string
}

/**
 * Test list component for displaying test items as interactive cards
 * Perfect for test suites showing individual test cases with status
 */
export const TestList: React.FC<TestListProps> = ({
  tests = [],
}) => {
  // Parse tests if it's a JSON string
  let testItems: TestItem[] = [];
  if (typeof tests === 'string') {
    try {
      testItems = JSON.parse(tests);
    } catch (e) {
      console.error('Failed to parse tests JSON:', e);
    }
  } else if (Array.isArray(tests)) {
    testItems = tests;
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'running':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
      default:
        return 'bg-secondary text-muted-foreground';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'passed':
        return 'Passed';
      case 'failed':
        return 'Failed';
      case 'running':
        return 'Running';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  return (
    <div className="not-prose space-y-3 mb-6">
      {testItems.map((test, index) => (
        <div
          key={index}
          className="bg-card p-4 rounded-lg border border-border hover:border-border/80 transition-colors"
        >
          <div className="flex items-start gap-4">
            {/* Radio button / Circle indicator */}
            <div className="shrink-0 mt-1">
              <div className="w-5 h-5 rounded-full border-2 border-border"></div>
            </div>

            {/* Test content */}
            <div className="grow min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="grow min-w-0">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {test.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {test.description}
                  </p>
                  {(test.method || test.endpoint) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      {test.method && <span className="font-semibold">{test.method}</span>}
                      {test.method && test.endpoint && <span>•</span>}
                      {test.endpoint && <span>{test.endpoint}</span>}
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <div className="shrink-0">
                  <span
                    className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${getStatusBadge(
                      test.status
                    )}`}
                  >
                    {getStatusLabel(test.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
