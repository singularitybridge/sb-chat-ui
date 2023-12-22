import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../store/common/RootStoreContext";
import { Assistant, IAssistant, getFields } from "../../store/models/Assistant";
import { withPage } from "../../components/admin/HOC/withPage";
import { DynamicForm, FieldConfig, FormValues } from "../../components/DynamicForm";

const EditAssistantView: React.FC = observer(() => {

  const headers = getFields(["assistantId", "name", "description", "voice"]);
  const { key } = useParams<{ key: string }>();
  const rootStore = useRootStore();
  const assistant = key ? rootStore.getAssistantById(key) : null;

  if (rootStore.assistantsLoaded === false) {
    return <div>Loading...</div>;
  }

  if (!assistant) {
    return <div>Assistant not found</div>;
  }

  const formFields : FieldConfig[]  = [
    {
      type: 'input',
      label: 'Name',
      value: 'testt',
      id: 'name'
    },
    {
      type: 'input',
      label: 'Avatar Image URL',
      value: '',
      id: 'avatarImage'
    },
    {
      type: 'textarea',
      label: 'Description',
      value: '',
      id: 'description'
    }
    
  ];
  const handleSubmit = (values : FormValues) => {
    console.log('Form Values:', values);
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
