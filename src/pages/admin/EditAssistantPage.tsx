import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../store/common/RootStoreContext";
import {
  Assistant,
  AssistantKeys,
  IAssistant,
} from "../../store/models/Assistant";
import { withPage } from "../../components/admin/HOC/withPage";
import {
  DynamicForm,
  FieldConfig,
  FieldType,
  FormValues,
} from "../../components/DynamicForm";
import { KeyValueList } from "../../components/KeyValueList";


const EditAssistantView: React.FC = observer(() => {

  const { key } = useParams<{ key: string }>();
  const rootStore = useRootStore();
  const assistant = key ? rootStore.getAssistantById(key) : null;

  if (rootStore.assistantsLoaded === false) {
    return <div>Loading...</div>;
  }

  if (!assistant) {
    return <div>Assistant not found</div>;
  }

  const fieldKeys: AssistantKeys[] = [
    "assistantId",
    "name",
    "description",
    "introMessage",
    "voice",
    "language",
    "identifiers",
  ];

  const formFields: FieldConfig[] = fieldKeys.map((key) => {
    const fieldKeyString = String(key);
    return {
      label: fieldKeyString.charAt(0).toUpperCase() + fieldKeyString.slice(1),
      value: assistant ? (assistant as any)[fieldKeyString] : "", // Using type assertion here
      id: fieldKeyString,
    };
  });

  const handleSubmit = (values: FormValues) => {
    console.log("Form Values:", values);
  };

  return (
    <>
      <div className="flex w-full">
        <div className="w-1/2">
          <DynamicForm fields={formFields} onSubmit={handleSubmit} />
        </div>
        <div className="w-1/2">Test your assistant here</div>
      </div>
    </>
  );
});

const EditAssistantPage = withPage(
  "AI Assistants",
  "manage your ai agents here"
)(EditAssistantView);
export { EditAssistantPage };
