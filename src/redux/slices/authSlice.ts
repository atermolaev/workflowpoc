import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loadCurrentUser, clearCurrentUser } from '@/globals/auth';
import type { CurrentUser } from '@/globals/types';

interface AuthState {
  currentUser: CurrentUser | null;
}

const initialState: AuthState = {
  currentUser: loadCurrentUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<CurrentUser>) {
      state.currentUser = action.payload;
    },
    logout(state) {
      state.currentUser = null;
      clearCurrentUser();
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
