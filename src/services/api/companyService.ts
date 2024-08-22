import { toJS } from 'mobx';
import { ICompany } from '../../store/models/Company';
import apiClient from '../AxiosService';

export const getCompany = async (): Promise<ICompany> => {
  try {
    const response = await apiClient.get('company');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch company', error);
    throw error;
  }
};

export const addCompany = async (company: ICompany): Promise<ICompany> => {
  try {
    const response = await apiClient.post('company', company);
    console.log('Server response for new company:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to add company', error);
    throw error;
  }
};

export const deleteCompany = async (): Promise<void> => {
  try {
    await apiClient.delete('company');
  } catch (error) {
    console.error('Failed to delete company', error);
    throw error;
  }
};

export const updateCompany = async (company: Partial<ICompany>): Promise<ICompany> => {
  try {
    console.log('cc', toJS(company), company);


    const response = await apiClient.put('company', company);
    return response.data;
  } catch (error) {
    console.error('Failed to update company', error);
    throw error;
  }
};

export const refreshCompanyToken = async (): Promise<ICompany> => {
  try {
    const response = await apiClient.put('company/refresh-token');
    return response.data;
  } catch (error) {
    console.error('Failed to refresh company token', error);
    throw error;
  }
};

export const updateCompanyInfo = async (companyInfo: {
  companyName: string;
  companyDescription: string;
  userName: string;
}): Promise<ICompany> => {
  try {
    const response = await apiClient.post('onboarding/update-info', companyInfo);
    return response.data.company;
  } catch (error) {
    console.error('Failed to update company info', error);
    throw error;
  }
};
