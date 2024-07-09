import { ICompany } from '../../store/models/Company';
import apiClient from '../AxiosService';

export const getCompanies = async (): Promise<ICompany[]> => {
  try {
    const response = await apiClient.get('company');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch companies', error);
    throw error;
  }
};

export const getDecryptedCompanyById = async (
  _id: string
): Promise<ICompany> => {
  try {
    const response = await apiClient.get(
      `company/decrypted/${_id}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch decrypted company', error);
    throw error;
  }
};

export const addCompany = async (company: ICompany): Promise<ICompany> => {
  try {
    const response = await apiClient.post('company', company);
    return response.data;
  } catch (error) {
    console.error('Failed to add company', error);
    throw error;
  }
};

export const deleteCompany = async (companyId: string): Promise<void> => {
  try {
    await apiClient.delete(`company/${companyId}`);
  } catch (error) {
    console.error('Failed to delete company', error);
    throw error;
  }
};

export const updateCompany = async (
  _id: string,
  company: ICompany
): Promise<ICompany> => {
  try {
    const response = await apiClient.put(
      `company/${_id}`,
      company
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update company', error);
    throw error;
  }
};

export const refreshCompanyToken = async (
  _id: string,
  company: ICompany
): Promise<ICompany> => {
  try {
    const response = await apiClient.put(
      `company/refresh-token/${_id}`,
      company
    );
    return response.data;
  } catch (error) {
    console.error('Failed to refresh company token', error);
    throw error;
  }
};
