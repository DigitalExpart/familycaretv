# FamilyCare TV Security Audit

## Objective
Verify that **User A** cannot access, modify, or delete resources belonging to **User B**. Because the system relies heavily on `patientId` as the parent relation for most entities, row-level ownership must be guaranteed in the backend endpoints.

## 1. Authentication Layer
- **Token**: Bearer JWT (Access Token).
- **Strategy**: `JwtAuthGuard` ensures `req.user` is populated with the authenticated User's `id`.

## 2. Patient Ownership
**Rule:** All Patients belong directly to a `User`.
- `GET /patients`: Queries `where: { userId: req.user.id }`.
- `GET /patients/:id`: Queries `where: { id: patientId, userId: req.user.id }`. Returns `404 Not Found` if User B tries to fetch User A's patient.
- `PATCH / DELETE /patients/:id`: Fails if `userId` doesn't match `req.user.id`.

## 3. Sub-resource Ownership (Doctors, Contacts, Medications, Events, Notes)
**Rule:** Sub-resources belong to a `Patient`.
To ensure User B cannot interact with a sub-resource belonging to User A's patient, the backend enforces a "Patient Verification" check before any CRUD operations on sub-resources.

### Verification Flow (Used in all sub-controllers):
Before creating, updating, or deleting a Doctor/Medication/Event:
1. The backend extracts `patientId` from the payload (or URL).
2. It calls `PatientsService.findOne(patientId, req.user.id)`.
3. If the patient does not belong to `req.user.id`, the query returns `null` and throws a `NotFoundException` (or `ForbiddenException`).

### Expected Results Matrix
| Action | User A (Owner) | User B (Attacker) | Expected HTTP Code |
|---|---|---|---|
| Read `Patient` | ✅ Success | ❌ Denied | `404 Not Found` |
| Edit `Patient` | ✅ Success | ❌ Denied | `404 Not Found` |
| Delete `Patient` | ✅ Success | ❌ Denied | `404 Not Found` |
| Create `Doctor` for A's Patient | ✅ Success | ❌ Denied | `404 Not Found` |
| Read `Medication` of A's Patient | ✅ Success | ❌ Denied | `404 Not Found` |
| Delete `Event` of A's Patient | ✅ Success | ❌ Denied | `404 Not Found` |

## Conclusion
The NestJS backend successfully isolates multi-tenant data. `req.user.id` is fundamentally required for all queries, ensuring that horizontal privilege escalation (BDOA / IDOR) vulnerabilities are mitigated across the API.
