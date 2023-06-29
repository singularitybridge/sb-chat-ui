import ReactJson from "react-json-view";

interface JSONViewProps {
  json: string | object;
}

const JSONView: React.FC<JSONViewProps> = ({ json }) => {
  let parsedJson;
  let isJson = true;
  let jsonString;

  try {
    if (typeof json === "string") {
      parsedJson = JSON.parse(json);
      jsonString = json;
    } else {
      parsedJson = json;
      jsonString = JSON.stringify(json);
    }
  } catch (e) {
    // In case of a parse error, it's not valid JSON
    isJson = false;
    jsonString = typeof json === "object" ? JSON.stringify(json) : json;
  }

  return isJson ? (
    <ReactJson
      src={parsedJson}
      theme="bright:inverted"
      displayDataTypes={false}
      displayObjectSize={false}
      enableClipboard={false}
      style={{
        backgroundColor: "transparent",
      }}
    />
  ) : (
    <pre className="text-xs overflow-auto bg-neutral-50 dark:bg-neutral-700 rounded-lg whitespace-pre-wrap">
      {jsonString}
    </pre>
  );
};

export { JSONView };
