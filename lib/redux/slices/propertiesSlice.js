// Holds the Auction Pipeline's property collection (currently sourced from Airtable via
// components/pipeline/airtable.js; the shape is whatever recordToRow() produces there).
//
// No thunks here on purpose. The existing loadAllDataFull/loadAllDataPartner functions in
// AuctionPipeline.jsx already ARE the async orchestration layer, and they contain bespoke
// control flow a generic thunk lifecycle doesn't model well (reopening the token/access-code
// gate on 401, clearing sessionStorage, toasting a specific message per failure mode). Turning
// that into createAsyncThunk would mean re-implementing it inside the slice — duplicated logic
// for no real gain. Components still call the existing Airtable service functions directly and
// dispatch these plain reducers to store the result; that already matches "Redux action → data
// service → Airtable" without inventing a parallel data-fetching path.
//
// Security note: this slice is a client-side cache for rendering, nothing more. It is not, and
// must never become, an authorization boundary — once Module 04's RLS lands, a row simply won't
// be fetchable in the first place if the signed-in user isn't allowed to see it. Nothing here
// should ever be used to decide what a user is allowed to do.

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  selectedId: null,
  loading: false,
  loaded: false,
  error: null,
  lastUpdated: null,
};

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    setPropertiesLoading(state, action) {
      state.loading = action.payload;
    },
    setProperties(state, action) {
      state.items = action.payload;
      state.loaded = true;
      state.loading = false;
      state.error = null;
      state.lastUpdated = Date.now();
    },
    addProperty(state, action) {
      state.items.unshift(action.payload);
      state.lastUpdated = Date.now();
    },
    addProperties(state, action) {
      state.items.unshift(...action.payload);
      state.lastUpdated = Date.now();
    },
    updateProperty(state, action) {
      const { id, changes } = action.payload;
      const idx = state.items.findIndex((r) => r.id === id);
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...changes };
      state.lastUpdated = Date.now();
    },
    updateProperties(state, action) {
      const { ids, changes } = action.payload;
      const idSet = new Set(ids);
      state.items = state.items.map((r) => (idSet.has(r.id) ? { ...r, ...changes } : r));
      state.lastUpdated = Date.now();
    },
    removeProperty(state, action) {
      state.items = state.items.filter((r) => r.id !== action.payload);
      state.lastUpdated = Date.now();
    },
    removeProperties(state, action) {
      const remove = new Set(action.payload);
      state.items = state.items.filter((r) => !remove.has(r.id));
      state.lastUpdated = Date.now();
    },
    selectProperty(state, action) {
      state.selectedId = action.payload;
    },
    clearProperties(state) {
      state.items = [];
      state.selectedId = null;
      state.loaded = false;
      state.lastUpdated = null;
    },
    setPropertiesLoaded(state, action) {
      state.loaded = action.payload;
    },
    setPropertiesError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setPropertiesLoading, setProperties, addProperty, addProperties, updateProperty,
  updateProperties, removeProperty, removeProperties, selectProperty, clearProperties,
  setPropertiesLoaded, setPropertiesError,
} = propertiesSlice.actions;

export const selectProperties = (state) => state.properties.items;
export const selectSelectedPropertyId = (state) => state.properties.selectedId;
export const selectSelectedProperty = (state) =>
  state.properties.items.find((r) => r.id === state.properties.selectedId) || null;
export const selectPropertiesLoading = (state) => state.properties.loading;
export const selectPropertiesLoaded = (state) => state.properties.loaded;
export const selectPropertiesError = (state) => state.properties.error;
export const selectPropertiesLastUpdated = (state) => state.properties.lastUpdated;

export default propertiesSlice.reducer;
