import ReactJson from 'react18-json-view';

interface JSONViewProps {
  json: string | object | number;
}

const JSONView: React.FC<JSONViewProps> = ({ json }) => {
  let parsedJson;
  let isJson = true;
  let jsonString;
  let isJsonObject = true;

  try {
    if (typeof json === 'string') {
      parsedJson = JSON.parse(json);
      jsonString = json;
      isJsonObject = typeof parsedJson === 'object';
    } else if (typeof json === 'number') {
      // If the input is a number, convert it to string
      parsedJson = json;
      jsonString = json.toString();
      isJsonObject = false;
    } else {
      parsedJson = json;
      jsonString = JSON.stringify(json);
      isJsonObject = typeof parsedJson === 'object';
    }
  } catch (e) {
    // In case of a parse error, it's not valid JSON
    isJson = false;
    jsonString =
      typeof json === 'object' ? JSON.stringify(json) : json.toString();
  }

  return isJson && isJsonObject ? (
    <ReactJson src={parsedJson} theme="default" enableClipboard={false} />
  ) : (
    <pre className="text-xs overflow-auto bg-neutral-50 dark:bg-neutral-700 rounded-lg whitespace-pre-wrap">
      {jsonString}
    </pre>
  );
};

export { JSONView };
