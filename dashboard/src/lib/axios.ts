import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const FIELD_LABELS: Record<string, string> = {
  modelYear: 'Model Year',
  brandId: 'Brand',
  modelId: 'Model',
  generationId: 'Generation',
  variantCode: 'Variant Code',
  fuelType: 'Fuel Type',
  transmissionType: 'Transmission Type',
  drivetrain: 'Drivetrain',
  seatingCapacity: 'Seating Capacity',
  doors: 'Doors',
  shortDescription: 'Short Description',
  displacementCc: 'Engine Displacement',
  powerHp: 'Engine Power',
  torqueNm: 'Engine Torque',
  cylinders: 'Cylinders',
  aspiration: 'Aspiration',
  isRequired: 'Required',
  sortOrder: 'Sort Order',
  options: 'Options',
};

const formatFieldLabel = (rawField: string): string => {
  const cleanField = rawField.replace(/^(body|query|params)\./, '');
  if (FIELD_LABELS[cleanField]) return FIELD_LABELS[cleanField];
  
  const lastPart = cleanField.split('.').pop() || cleanField;
  return lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatNaturalErrorMessage = (field: string, msg: string): string => {
  const label = formatFieldLabel(field);
  let cleanMsg = msg;

  if (cleanMsg.includes('Too big: expected number to be <=')) {
    const maxVal = cleanMsg.split('<=').pop()?.replace(/\D/g, '').trim();
    if (field.toLowerCase().includes('year')) {
      cleanMsg = `must be ${maxVal} or earlier`;
    } else {
      cleanMsg = `must be ${maxVal} or less`;
    }
  } else if (cleanMsg.includes('Too small: expected number to be >=')) {
    const minVal = cleanMsg.split('>=').pop()?.replace(/\D/g, '').trim();
    cleanMsg = `must be at least ${minVal}`;
  } else if (cleanMsg === 'Required' || cleanMsg === 'Expected string, received null') {
    cleanMsg = 'is required';
  } else if (cleanMsg.includes('Invalid ObjectId')) {
    cleanMsg = 'is invalid';
  }

  const startsWithVerb = cleanMsg.toLowerCase().startsWith('is ') || cleanMsg.toLowerCase().startsWith('must ') || cleanMsg.toLowerCase().startsWith('cannot ');
  return `${label} ${startsWithVerb ? cleanMsg : ': ' + cleanMsg}`;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem('accessToken', data.data.accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    if (error.response?.data?.message) {
      let customMessage = error.response.data.message;
      if (error.response.data.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
        const details = error.response.data.errors
          .map((el: any) => formatNaturalErrorMessage(el.field || '', el.message || ''))
          .join('; ');
        
        if (customMessage.toLowerCase().includes('validation failed')) {
          customMessage = details;
        } else {
          customMessage = `${customMessage}: ${details}`;
        }
      }
      error.message = customMessage;
    }
    return Promise.reject(error);
  }
);

export default api;
