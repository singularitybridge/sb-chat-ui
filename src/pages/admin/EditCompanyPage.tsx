import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { ICompany } from '../../store/models/Company';
import { withPage } from '../../components/admin/HOC/withPage';
import { DynamicForm, FieldConfig, FormValues } from '../../components/DynamicForm';
import { toJS } from 'mobx';
import { companyFieldConfigs } from '../../store/fieldConfigs/companyFieldConfigs'; // Assuming similar structure as assistantFieldConfigs

const EditCompanyView: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const rootStore = useRootStore();
  const company = id ? rootStore.getCompanyById(id) : null;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!rootStore.companiesLoaded) {
      // Logic to load companies if not already loaded
    }
  }, [rootStore]);

  if (rootStore.companiesLoaded === false) {
    return <div>Loading...</div>;
  }

  if (!company) {
    return <div>Company not found</div>;
  }

  const formFields: FieldConfig[] = companyFieldConfigs.map(({ id, label, key, type, visibility }) => {
    const fieldKeyString = String(key);
    return {
      key: key,
      label: label,
      value: company ? toJS((company as any)[fieldKeyString]) : '',
      id: id,
      type: type,
      visibility: visibility,
    };
  });

  const handleSubmit = async (values: FormValues) => {
    console.log('Form Values:', values);
    if (!id) {
      return;
    }
    setIsLoading(true);
    await rootStore.updateCompany(id, values as unknown as ICompany);
    setIsLoading(false);
  };

  return (
    <>
      <div className="flex w-full">
        <div className="w-1/2">
          <DynamicForm
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            formType="update"
          />
        </div>
        <div className="w-1/2">
          {/* Additional UI or functionality related to company can be added here */}
        </div>
      </div>
    </>
  );
});

const EditCompanyPage = withPage(
  'Edit Company',
  'Update company details here',
  () => { console.log('edit company'); }
)(EditCompanyView);

export { EditCompanyPage, EditCompanyView };
