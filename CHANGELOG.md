# Changelog - Roku Client

## [1.0.0-rc.1] - 2026-07-08

### Added
- **CalendarScreen**: Unified calendar view grouping Medications, Appointments, and Tasks by date.
- **BooksScreen**: Implemented dynamic book catalog with Hero layout and deep-linking from the Home Screen.
- **Today's Summary**: Added a quick glance summary rail to the Home Screen displaying counts for all daily tasks and appointments.
- **Branded Fallback Assets**: Replaced missing or incomplete API artwork with professional, branded fallback graphics.
- **Sidebar Navigation**: Implemented `SidebarMenu` to allow traversal between core modules.

### Changed
- **Screensaver**: Overhauled layout to prioritize the Verse of the Day, dynamic QR Code generation, Book of the Day cover, and live reminder ticker.
- **Artwork Fallbacks**: Modified `ColoringScreen`, `HomeScreen`, `KidsScreen`, `MusicScreen`, `PatientsScreen`, `PetsScreen`, and `TasksScreen` to utilize `fallback_artwork.png`.

### Removed
- **Hardcoded Placeholders**: Removed all references to `placeholder.jpg` and `placeholder_qr.jpg`.
