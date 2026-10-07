# Changelog

All notable changes to this project will be documented in this file.

## [2026-10-07]

### Added

- Added "Data Backup", "Permission Management", and "System Parameters" placeholder buttons in System Settings page.
- Added multi-language support for all table headers, buttons, and prompts (Chinese / English / Russian).
- Added auto-fill of username on login page after role switching.

### Changed

- Unified system name to "NSIM-System" on login page and sidebar.
- Unified footer to "© 2026 Zhang Jun | VSTU - NSIM-System".
- Adjusted chart titles to avoid overlapping with data points.
- Compressed chart height to provide more space for the data table.

### Removed

- Removed "Home" button from sidebar navigation.

### Fixed

- Fixed login redirect issue by changing navigate target to `/dashboard`.
- Fixed mixed-language issue in Cashier, Dashboard, and System Settings pages.
- Fixed role switching behavior: original user is now restored after logout.

### Documentation

- Updated README to align with thesis title:
  "Development and Optimisation of a Network Store Inventory Management System"

## [2026-10-07]

### Added

- Inventory management module (inbound, outbound, warnings, stock ledger)
- Smart replenishment module with weighted moving average algorithm
- Replenishment order management (create, update status, confirm receipt)
- Inventory turnover rate analysis (rate, days, stock value)
- 2D warehouse map with zone partitioning and clickable slots
- Stock ledger recording every inventory change

### Changed

- Dashboard now includes turnover rate cards
- Product page supports URL-based filtering from warehouse map
- Warehouse map supports zone-based layout (A/B/C/D zones)

### Fixed

- Removed React.StrictMode to avoid G6 double-render issues
- Fixed G6 5.x click event handling via node ID reverse lookup
