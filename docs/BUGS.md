# FamilyCare TV Bug Tracker

This ledger tracks all active, pending, and resolved bugs discovered during QA or deployment.

## Bug Reporting Template

Please use the following format when submitting new issues to this file:

```markdown
### [BUG-ID] Short Title
- **Status:** Open | In Progress | Resolved
- **Severity:** Low | Medium | High | Critical
- **Description:** A brief overview of the defect.
- **Steps to Reproduce:**
  1. ...
  2. ...
- **Expected Result:** What should happen.
- **Actual Result:** What actually happened.
- **Proposed/Actual Fix:** Details on the remediation (or PR link).
```

---

## Active Issues

### [BUG-001] AI Disclaimer Not Localized
- **Status:** Open
- **Severity:** Low
- **Description:** The OpenAI endpoint provides medical info in Spanish when requested, but the static legal disclaimer appended by the NestJS backend is hardcoded in English.
- **Steps to Reproduce:**
  1. Set mobile app language to Spanish.
  2. Trigger AI lookup for a medication.
  3. Observe that the payload response `disclaimer` string remains English.
- **Expected Result:** Disclaimer string should map to `es.json` or be dynamically generated in Spanish.
- **Actual Result:** Disclaimer reads "Always consult a medical professional..." in English.
- **Proposed Fix:** Use server-side `i18n` logic inside `AiService` or shift the disclaimer rendering entirely to the mobile client using `t('disclaimer')`.

### [BUG-002] Delete Patient Confirmation is Hardcoded
- **Status:** Open
- **Severity:** Low
- **Description:** The React Native `Alert.alert` dialog for deleting a patient bypasses `react-i18next`.
- **Steps to Reproduce:**
  1. Set language to Spanish.
  2. Attempt to delete a patient.
- **Expected Result:** Alert title and buttons say "Eliminar Paciente".
- **Actual Result:** Alert displays "Delete Patient?".
- **Proposed Fix:** Wrap the Alert strings with `t()`.
