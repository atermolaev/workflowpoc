import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * RTK Query API для взаимодействия с backend.
 * Endpoints будут добавляться по мере готовности REST API.
 * Сейчас используется как заглушка (PoC работает через localStorage + Redux слайсы).
 */
export const workflowApi = createApi({
  reducerPath: 'workflowApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Brief', 'Asset', 'User'],
  endpoints: () => ({}),
});
