// Shared between AdminUsersPage.jsx's invite form and AdminAssignmentsPage.jsx's per-user view —
// one definition of the four individually-grantable permissions. Keys match
// lib/permissions/fieldGroups.js's ROLE_DEFAULT_PERMISSIONS and the request/response shape of
// both app/api/admin/invite and app/api/admin/assignments's setPermissions action.
export const PERMISSION_FIELDS = [
  { key: 'create_property', label: 'Create a property record' },
  { key: 'edit_acquisition_fields', label: 'Edit acquisition fields' },
  { key: 'edit_disposition_fields', label: 'Edit disposition fields' },
  { key: 'edit_title_fields', label: 'Edit title fields' },
];
