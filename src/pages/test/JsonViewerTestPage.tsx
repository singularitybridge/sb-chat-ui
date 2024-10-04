import React from 'react';
import { JsonViewer } from '../../components/sb-core-ui-kit/JsonViewer';

const testData = {
  shortField: "This is a short field",
  longField: "This is a very long field that should demonstrate the word-wrapping capability of our updated JsonViewer component. It contains a lot of text that would normally cause horizontal scrolling, but now it should wrap nicely within the component.",
  nestedObject: {
    field1: "Nested short field",
    field2: "Another long nested field that demonstrates how the JsonViewer handles nested objects with long text content. This should also wrap within the component without causing horizontal scrolling.",
  },
  arrayField: [
    "Short array item",
    "Long array item that also demonstrates word-wrapping within array elements. This text should also wrap nicely within the JsonViewer component.",
  ],
};

const JsonViewerTestPage: React.FC = () => {
  const testMessageId = "test-message-123";
  const testInput = "Test input for upload/save functionality";
  const testOutput = "Test output for upload/save functionality";

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">JsonViewer Test Page</h1>
      <div className="w-full max-w-2xl">
        <JsonViewer 
          data={testData} 
          maxHeight="400px" 
          messageId={testMessageId}
          input={testInput}
          output={testOutput}
        />
      </div>
      <div className="mt-4">
        <p>Test Instructions:</p>
        <ol className="list-decimal list-inside">
          <li>Verify that the copy icon (top-right) is slightly smaller and has more space around it.</li>
          <li>Click the new upload/save icon (second from top-right) and check the browser console for the logged message ID, input, and output.</li>
        </ol>
      </div>
    </div>
  );
};

export default JsonViewerTestPage;