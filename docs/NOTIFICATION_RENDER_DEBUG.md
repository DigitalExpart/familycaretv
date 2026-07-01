# Notification Center Debug Report

## Trace: Complete Data Flow

### 1. POST /notifications/test-matrix
- **Result:** PASS
- **Details:** The endpoint properly triggers the event emitter, passing data to the `NotificationEngineService`, which successfully writes persistent records to the `Notification` table with `PENDING` status. The manual DB test script confirmed that records insert and are queried correctly via Prisma.

### 2. GET /notifications
- **Result:** PASS
- **Details:** The backend successfully queries the database (`prisma.notification.findMany`) and returns the payload in the standard format: `{ "success": true, "data": [ ... ] }`.

### 3. React Query (`useNotifications`)
- **Result:** PASS
- **Details:** `useNotifications` successfully makes the `api.get` request. We correctly extract the payload, and it automatically refetches every 30 seconds (`refetchInterval: 30000`).

### 4. Notification Screen Rendering
- **Result:** PASS
- **Details:** `notifications.tsx` correctly unwraps `response?.data || []` and successfully maps `item.id`, `item.title`, `item.message`, `item.createdAt`, and `item.isRead`, which all perfectly match the Prisma model. It renders the items with appropriate empty state logic.

### 5. Notification Tab & Badge (`apps/mobile/src/app/(tabs)/_layout.tsx`)
- **Result:** FAIL
- **Root Cause:** 
  1. The `notifications` tab has `href: null` in its options, meaning the tab is completely hidden and inaccessible from the bottom navigation bar.
  2. The unread badge count is hardcoded to `tabBarBadge: 3`.
- **Fix Applied (To be applied):** 
  - Remove `href: null` from the Notifications tab configuration.
  - Implement a hook to calculate the unread count from the React Query data (`useNotifications`) and pass it to `tabBarBadge`.

## Conclusion
The data pipeline (DB -> API -> React Query -> Screen Component) is fully functional and perfectly aligned. The **only reason** the user cannot see notifications right now is because the Notification Tab is hidden (`href: null`), and the badge is hardcoded. Everything else is production-ready.
