import axios from 'axios';
import { ICompany } from '../../store/models/Company';

export const getCompanies = async (): Promise<ICompany[]> => {
  try {
    const response = await axios.get('http://localhost:3000/company');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch companies', error);
    throw error;
  }
};

export const addCompany = async (company: ICompany): Promise<ICompany> => {
  try {
    const response = await axios.post('http://localhost:3000/company', company);
    return response.data;
  } catch (error) {
    console.error('Failed to add company', error);
    throw error;
  }
};

export const deleteCompany = async (companyId: string): Promise<void> => {
  try {
    await axios.delete(`http://localhost:3000/company/${companyId}`);
  } catch (error) {
    console.error('Failed to delete company', error);
    throw error;
  }
};

export const updateCompany = async ( _id : string, company: ICompany): Promise<ICompany> => {
  try {
    const response = await axios.put(`http://localhost:3000/company/${_id}`, company);
    return response.data;
  } catch (error) {
    console.error('Failed to update company', error);
    throw error;
  }
}