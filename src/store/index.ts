import { configureStore } from '@reduxjs/toolkit';
import queryReducer from './querySlice';

export const store = configureStore({
  reducer: {
    queries: queryReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;