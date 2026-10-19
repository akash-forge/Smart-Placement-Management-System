// Central place for small app-wide constants that used to be
// hardcoded (and duplicated) across App.tsx, AppSidebar.tsx and AppHeader.tsx.
//
// App-wide background gradient now lives in index.css as a CSS variable
// (--app-bg, applied via the .app-bg class) instead of here, since it
// needed a dark-mode-aware value and CSS variables handle that without JS.

// Default avatar shown whenever a user has no avatarUrl (or it fails to
// load). Previously this was inconsistent across the app — some places
// (StaffTable1, CompanyTable1, StudentTable1, UserMetaCard) fell back to
// two different local paths ("/images/user/avatar1.jfif" and
// "/images/user/profile4.jfif") that may or may not actually exist in
// public/, and one place (UserDropdown, the header avatar shown on every
// page) had no fallback at all, so a user with no avatar just showed a
// broken image icon there. An inline SVG data URI can never 404, so this
// is used everywhere now instead of a file path.
export const DEFAULT_AVATAR_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23171717'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%239ee600'/%3E%3Cpath d='M6 36c0-8 6-13 14-13s14 5 14 13' fill='%239ee600'/%3E%3C/svg%3E";

