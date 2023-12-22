import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../store/common/RootStoreContext";
import { Tab, initTE } from "tw-elements";
import { Table } from "../../components/Table";
import { toJS } from "mobx";
import {
  Assistant,
  AssistantKeys,
  IAssistant,
} from "../../store/models/Assistant";
import { withPage } from "../../components/admin/HOC/withPage";
import { convertToStringArray } from "../../utils/utils";

const AssistantsView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const navigate = useNavigate();

  const headers: AssistantKeys[] = [
    "assistantId",
    "name",
    "description",
    "voice",
  ];

  return (
    <>
      <div className="flex w-full">
        <Table
          headers={convertToStringArray(headers)}
          data={toJS(rootStore.assistants)}
          onRowClick={(row: IAssistant) =>
            navigate(`/admin/assistants/${row._id}`)
          }
        />
      </div>
    </>
  );
});

const AssistantsPage = withPage(
  "AI Assistants",
  "manage your ai agents here"
)(AssistantsView);
export { AssistantsPage };
