import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../store/common/RootStoreContext";
import { Tab, initTE } from "tw-elements";
import { Table } from "../../components/Table";
import { toJS } from "mobx";
import { Assistant, IAssistant, getFields } from "../../store/models/Assistant";
import { withView } from "../../components/admin/HOC/withView";

const EditAssistant: React.FC = observer(() => {
  
  const { key } = useParams<{ key: string }>();
  const rootStore = useRootStore();
  const headers = getFields(["assistantId", "name", "description", "voice"]);
  const navigate = useNavigate();

 
  return (
    <>
      <div className="flex w-full">
        hello
      </div>
    </>
  );
});

const EditAssistantWithView = withView('AI Assistants', 'manage your ai agents here')(EditAssistant);
export { EditAssistantWithView as EditAssistantsView };
