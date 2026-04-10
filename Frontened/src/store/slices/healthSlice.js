import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  healthScore: 85,
  caloricIntake: { current: 1800, target: 2200 },
  stressLevel: 'Low',
  aqiData: null,
};

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    updateHealthData: (state, action) => {
      return { ...state, ...action.payload };
    },
    setAqiData: (state, action) => {
      state.aqiData = action.payload;
    }
  },
});

export const { updateHealthData, setAqiData } = healthSlice.actions;
export default healthSlice.reducer;
