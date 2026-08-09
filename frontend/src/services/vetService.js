import api from './api';

export const getAnimals = async () => {
  const res = await api.get('/animals');
  return res.data;
};

export const getDiseases = async () => {
  const res = await api.get('/diseases');
  return res.data;
};

export const getVaccinations = async () => {
  const res = await api.get('/vaccinations');
  return res.data;
};

export const getTreatments = async () => {
  const res = await api.get('/treatments');
  return res.data;
};

export const savePrediction = async (predictionData) => {
  const res = await api.post('/predictions', predictionData);
  return res.data;
};

export const getHealthRecords = async () => {
  const res = await api.get('/healthRecords');
  return res.data;
};
