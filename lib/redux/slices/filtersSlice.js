// Centralizes the Auction Pipeline's toolbar/table filter state. Field names mirror exactly what
// the app already has — no county/outcome/clearTitle/location filters were added here because
// those aren't toolbar filters in the current app (they're per-row editable field values), and
// inventing new filter criteria isn't in scope for this refactor.
//
// `auctionMonth` starts `null` on purpose (not today's month): the original component only knows
// "today" once it's mounted in the browser, and computing it during the initial render produced
// a server/client mismatch. AuctionPipeline sets it via dispatch in its boot effect, same as the
// old useState(null) + useEffect did.

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  search: '',
  stateFilter: '',
  statusFilter: '',
  upcomingOnly: false,
  attentionOnly: false,
  selectedTab: 'ALL',
  auctionMonth: null,
  sortKey: 'saleDate',
  sortDir: 1,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
    },
    setStateFilter(state, action) {
      state.stateFilter = action.payload;
    },
    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
    },
    setUpcomingOnly(state, action) {
      state.upcomingOnly = action.payload;
    },
    setAttentionOnly(state, action) {
      state.attentionOnly = action.payload;
    },
    setSelectedTab(state, action) {
      state.selectedTab = action.payload;
    },
    setAuctionMonth(state, action) {
      state.auctionMonth = action.payload;
    },
    setSort(state, action) {
      const key = action.payload;
      if (state.sortKey === key) state.sortDir *= -1;
      else { state.sortKey = key; state.sortDir = 1; }
    },
  },
});

export const {
  setSearch, setStateFilter, setStatusFilter, setUpcomingOnly, setAttentionOnly,
  setSelectedTab, setAuctionMonth, setSort,
} = filtersSlice.actions;

export const selectFilters = (state) => state.filters;
export const selectSearch = (state) => state.filters.search;
export const selectStateFilter = (state) => state.filters.stateFilter;
export const selectStatusFilter = (state) => state.filters.statusFilter;
export const selectUpcomingOnly = (state) => state.filters.upcomingOnly;
export const selectAttentionOnly = (state) => state.filters.attentionOnly;
export const selectSelectedTab = (state) => state.filters.selectedTab;
export const selectAuctionMonth = (state) => state.filters.auctionMonth;
export const selectSortKey = (state) => state.filters.sortKey;
export const selectSortDir = (state) => state.filters.sortDir;

export default filtersSlice.reducer;
