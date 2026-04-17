import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workflowReducer from './slices/workflowSlice';
import { workflowApi } from './api/workflowApi';
import { persistState } from '@/globals/state';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workflow: workflowReducer,
    [workflowApi.reducerPath]: workflowApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(workflowApi.middleware),
});

// Persist workflow state to localStorage on every store update
store.subscribe(() => {
  persistState(store.getState().workflow);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
