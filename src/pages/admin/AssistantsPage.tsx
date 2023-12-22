import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../store/common/RootStoreContext";
import { Tab, initTE } from "tw-elements";
import { Table } from "../../components/Table";
import { toJS } from "mobx";
import { Assistant, IAssistant, getFields } from "../../store/models/Assistant";
import { withPage } from "../../components/admin/HOC/withPage";

const AssistantsView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const headers = getFields(["assistantId", "name", "description", "voice"]);
  const navigate = useNavigate();

  return (
    <>
      <div className="flex w-full">
        <Table
          headers={headers}
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
