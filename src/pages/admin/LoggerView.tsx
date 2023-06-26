import React, { useEffect, useState } from "react";
import { IconButton } from "../../components/admin/IconButton";
import { observer } from "mobx-react-lite";
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  BoltIcon,
  ChatBubbleLeftEllipsisIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { DataItem } from "../../components/admin/DataItem";
import { LogItem } from "../../components/admin/LogItem";

import Pusher from "pusher-js";

var pusher = new Pusher("7e8897731876adb4652f", {
  cluster: "eu",
});

interface LoggerViewProps {}

const LoggerView: React.FC<LoggerViewProps> = observer(() => {
  useEffect(() => {
    const channel = pusher.subscribe("logger");
    channel.bind("log-message", function (data: any) {
      console.log("logger", data);
    });
  }, []);

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Logger</h2>{" "}
        <div className="">
          <IconButton
            icon={<TrashIcon className="w-5 h-5 text-sky-800" />}
            onClick={() => {}}
          />
        </div>
      </div>

      <div className="flex flex-col mt-8 text-slate-400">
        <ol className="border-l-2 border-info-100">
          <LogItem
            icon={<ChatBubbleLeftEllipsisIcon className="w-4 h-4" />}
            title="user_input"
            input="hi"
            status="success"
          />
          <LogItem
            icon={<BoltIcon className="w-4 h-4" />}
            title="gpt_query"
            input="hi"
            output="ads dad ada da dadas "
            status="success"
            indent
          />
        </ol>
      </div>
    </div>
  );
});

export { LoggerView };
