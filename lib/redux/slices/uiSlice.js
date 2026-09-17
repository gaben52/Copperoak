// Genuinely shared/coordinated UI state for the Auction Pipeline — a modal opened from the
// header needs to be closed from inside the modal, a toast fired from a dozen different actions
// needs one place to land, row selection is read by the toolbar (bulk action buttons) and
// written by the table. None of this is "every visual boolean" — hover states, dropdown-open
// flags, per-field edit state, etc. all stay as component-local useState, untouched.
//
// selectedRowIds is a plain array, not a Set: Redux Toolkit's default middleware warns on
// non-serializable state (Sets included), and an array serializes cleanly for the DevTools/
// devtools time-travel this task asks to keep working. Components that need Set semantics
// (RowsTable's `.has()` checks) build a Set from this array at the point of use.

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toast: { msg: '', show: false },
  modals: {
    bulkPaste: false,
    bulkDate: false,
  },
  arvBlackout: false,
  selectedRowIds: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast(state, action) {
      state.toast = { msg: action.payload, show: true };
    },
    hideToast(state) {
      state.toast.show = false;
    },
    openBulkPasteModal(state) {
      state.modals.bulkPaste = true;
    },
    closeBulkPasteModal(state) {
      state.modals.bulkPaste = false;
    },
    openBulkDateModal(state) {
      state.modals.bulkDate = true;
    },
    closeBulkDateModal(state) {
      state.modals.bulkDate = false;
    },
    toggleArvBlackout(state) {
      state.arvBlackout = !state.arvBlackout;
    },
    toggleRowSelected(state, action) {
      const { id, checked } = action.payload;
      const has = state.selectedRowIds.includes(id);
      if (checked && !has) state.selectedRowIds.push(id);
      else if (!checked && has) state.selectedRowIds = state.selectedRowIds.filter((x) => x !== id);
    },
    setRowsSelected(state, action) {
      const { ids, checked } = action.payload;
      if (checked) {
        const set = new Set(state.selectedRowIds);
        ids.forEach((id) => set.add(id));
        state.selectedRowIds = Array.from(set);
      } else {
        const remove = new Set(ids);
        state.selectedRowIds = state.selectedRowIds.filter((id) => !remove.has(id));
      }
    },
    removeSelectedRowIds(state, action) {
      const remove = new Set(action.payload);
      state.selectedRowIds = state.selectedRowIds.filter((id) => !remove.has(id));
    },
    clearSelectedRowIds(state) {
      state.selectedRowIds = [];
    },
  },
});

export const {
  showToast, hideToast, openBulkPasteModal, closeBulkPasteModal, openBulkDateModal,
  closeBulkDateModal, toggleArvBlackout,
  toggleRowSelected, setRowsSelected, removeSelectedRowIds, clearSelectedRowIds,
} = uiSlice.actions;

export const selectToast = (state) => state.ui.toast;
export const selectModals = (state) => state.ui.modals;
export const selectArvBlackout = (state) => state.ui.arvBlackout;
export const selectSelectedRowIds = (state) => state.ui.selectedRowIds;

export default uiSlice.reducer;
