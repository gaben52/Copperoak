// State shape only — Module 03 (Supabase Auth) has not been built yet. Nothing dispatches into
// this slice today; it exists so the eventual auth implementation has a Redux shape to populate
// rather than inventing one under time pressure later.
//
// Deliberately absent from `session`: the actual access/refresh JWT. Supabase's own client keeps
// the live session (and refreshes it) in its own storage; mirroring the token into Redux would
// duplicate a secret for no benefit. If/when Module 03 lands, populate `session` with
// non-sensitive metadata only (e.g. expires_at) — never the token string.
//
// Also never treat `role` read from here as an authorization check — see the RLS/Redux boundary
// note in the propertiesSlice file.

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  profile: null,
  role: null,
  session: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading(state, action) {
      state.loading = action.payload;
    },
    setAuthError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    setSession(state, action) {
      const { user = null, profile = null, role = null, session = null } = action.payload || {};
      state.user = user;
      state.profile = profile;
      state.role = role;
      state.session = session;
      state.isAuthenticated = Boolean(session);
      state.loading = false;
      state.error = null;
    },
    clearAuth() {
      return initialState;
    },
  },
});

export const { setAuthLoading, setAuthError, setSession, clearAuth } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentProfile = (state) => state.auth.profile;
export const selectCurrentRole = (state) => state.auth.role;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
