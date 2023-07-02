import React, { useEffect, useState } from "react";
import { IconButton } from "../../components/admin/IconButton";
import { observer } from "mobx-react-lite";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  BoltIcon,
  ChatBubbleLeftEllipsisIcon,
  PauseCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { DataItem } from "../../components/admin/DataItem";
import { LogItem } from "../../components/admin/LogItem";

import Pusher from "pusher-js";
import {
  ArrowPathRoundedSquareIcon,
  CodeBracketIcon,
  CommandLineIcon,
  PaintBrushIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/solid";
import { JSONView } from "./JSONView";

var pusher = new Pusher("7e8897731876adb4652f", {
  cluster: "eu",
});

interface LoggerViewProps {}

const LoggerView: React.FC<LoggerViewProps> = observer(() => {
  const [logs, setLogs] = useState<
    Array<{
      icon: React.ReactNode;
      title: string;
      name: string;
      input: string;
      output?: string;
      status: string;
      indent?: boolean;
      isDebugLog?: boolean; // New variable
    }>
  >([]);

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    const channel = pusher.subscribe("logger");
    channel.bind("log-message", function (data: any) {
      console.log("logger", data);

      if (!data.name || !data.input || !data.status) {
        console.error(`Invalid log message: ${JSON.stringify(data, null, 2)}`);
        return;
      }

      let icon: React.ReactNode;
      let indent: boolean;
      let isDebugLog: boolean = false; // Additional variable to track if it's a debug log

      switch (data.name) {
        case "user_input":
          icon = <RocketLaunchIcon className="w-4 h-4" />;
          indent = false;
          break;
        case "gpt_query":
          icon = <BoltIcon className="w-4 h-4" />;
          indent = true;
          break;
        case "gpt_query_debug": // New case
          icon = <BoltIcon className="w-4 h-4" />;
          indent = true;
          isDebugLog = true; // Set it as debug log
          break;        
        case "set_state":
          icon = <CodeBracketIcon className="w-4 h-4" />;
          indent = true;
          break;
        case "response_to_ui":
          icon = <CommandLineIcon className="w-4 h-4" />;
          indent = true;
        case "extract_json":
          icon = <ArrowPathRoundedSquareIcon className="w-4 h-4" />;
          indent = true;
          break;
        case "generate_images":
          icon = <PauseCircleIcon className="w-4 h-4" />;
          indent = true;
          break;
        default:
          console.error(`Unsupported log message name: ${data.name}`);
          return;
      }

      const newLog = {
        icon,
        name: data.name,
        title: data.title,
        input: data.input, // Don't stringify here
        output: data.output, // Don't stringify here
        status:
          typeof data.status === "boolean"
            ? data.status
              ? "success"
              : "failed"
            : data.status,
        indent,
        isDebugLog
      };

      setLogs((prevLogs) => [...prevLogs, newLog]);
    });
  }, []);

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Logger</h2>{" "}
        <div className="">
          <IconButton
            icon={<TrashIcon className="w-5 h-5 text-sky-800" />}
            onClick={clearLogs}
          />
        </div>
      </div>

      <div className="flex flex-col mt-8 text-slate-400">
        <ol className="border-l-2 border-info-100">
          {logs.map((log, index) => (
            <LogItem
              key={index}
              name={log.name}
              icon={log.icon}
              title={log.title}
              input={<JSONView json={log.input} />} // Use JSONView here
              output={log.output ? <JSONView json={log.output} /> : undefined} // Use JSONView here
              status={log.status}
              indent={log.indent}
              isDebugLog={log.isDebugLog} // Pass the isDebugLog to LogItem
            />
          ))}
        </ol>
      </div>
    </div>
  );
});

export { LoggerView };
