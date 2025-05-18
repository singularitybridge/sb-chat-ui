import apiClient from '../AxiosService';
import { singleFlight } from '../../utils/singleFlight';


export const getOnboardingStatus = () =>
  singleFlight('GET /onboarding/status', () =>
    apiClient.get('/onboarding/status').then((res) => res.data)
  );

export const updateOnboardingStatus = () =>
  singleFlight('POST /onboarding/status', () =>
    apiClient.post('/onboarding/status', {}).then((res) => res.data)
  );
