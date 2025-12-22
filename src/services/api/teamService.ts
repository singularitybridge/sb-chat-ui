import apiClient from '../AxiosService';
import { ITeam } from '../../types/entities';

export async function getTeams(): Promise<ITeam[]> {
  try {
    const response = await apiClient.get('teams');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    throw error;
  }
}

export async function getTeam(id: string): Promise<ITeam> {
  try {
    const response = await apiClient.get(`teams/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch team:', error);
    throw error;
  }
}

export async function addTeam(team: Omit<ITeam, '_id'>): Promise<ITeam> {
  try {
    const response = await apiClient.post('teams', team);
    return response.data;
  } catch (error) {
    console.error('Failed to add team:', error);
    throw error;
  }
}

export async function updateTeam(id: string, team: ITeam): Promise<ITeam> {
  try {
    const response = await apiClient.put(`teams/${id}`, team);
    return response.data;
  } catch (error) {
    console.error('Failed to update team:', error);
    throw error;
  }
}

export async function deleteTeam(id: string): Promise<void> {
  try {
    await apiClient.delete(`teams/${id}`);
  } catch (error) {
    console.error('Failed to delete team:', error);
    throw error;
  }
}

export async function getTeamAssistants(teamId: string): Promise<any[]> {
  try {
    const response = await apiClient.get(`teams/${teamId}/assistants`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch team assistants:', error);
    throw error;
  }
}

export async function assignAssistantToTeam(teamId: string, assistantId: string): Promise<void> {
  try {
    await apiClient.post(`teams/${teamId}/assistants/${assistantId}`);
  } catch (error) {
    console.error('Failed to assign assistant to team:', error);
    throw error;
  }
}

export async function removeAssistantFromTeam(teamId: string, assistantId: string): Promise<void> {
  try {
    await apiClient.delete(`teams/${teamId}/assistants/${assistantId}`);
  } catch (error) {
    console.error('Failed to remove assistant from team:', error);
    throw error;
  }
}
