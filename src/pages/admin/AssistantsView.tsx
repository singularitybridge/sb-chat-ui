import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../store/common/RootStoreContext";
import { Tab, initTE } from "tw-elements";
import { Table } from "../../components/Table";
import { toJS } from "mobx";
import { Assistant, IAssistant, getFields } from "../../store/models/Assistant";

const AssistantsView: React.FC = observer(() => {
  
  const { key } = useParams<{ key: string }>();
  const rootStore = useRootStore();
  const headers = getFields(["assistantId", "name", "description", "voice"]);

  useEffect(() => {
    const loadData = async () => {
      if (rootStore.activeChatbot?.key) {
        await rootStore.loadChatSessions(rootStore.activeChatbot.key);
        rootStore.setActiveChatSession(rootStore.chatSessions[0]._id);
      }

      if (rootStore.chatbotsLoaded && key) {
        rootStore.setActiveChatbot(key);
      }
    };

    loadData();
    initTE({ Tab });
  }, [rootStore.activeChatbot?.key, rootStore.chatbotsLoaded, key]);

  return (
    <>
      <div className="flex w-full">
        <Table headers={headers} data={toJS(rootStore.assistants)} />
      </div>
    </>
  );
});

export { AssistantsView };
