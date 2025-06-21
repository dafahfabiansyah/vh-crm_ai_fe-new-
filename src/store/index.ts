import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import whatsappReducer from './whatsappSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    whatsapp: whatsappReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
