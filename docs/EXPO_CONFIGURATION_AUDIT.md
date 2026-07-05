# EXPO Configuration Audit

## Document Reviewed
- `apps/mobile/app.json`
- `apps/mobile/eas.json`
- `apps/mobile/package.json`

## Verifications
- **Android package**: ✅ `com.familycaretv.app`
- **Firebase/google-services.json**: ✅ Present (`"googleServicesFile": "./google-services.json"`) and the physical file has been placed in the directory.
- **Project ID**: ✅ `99e4f2a6-6057-4618-aebf-6972f5dd7630` is correctly linked in `extra.eas.projectId`.
- **Notification permissions**: ✅ Managed via `expo-notifications` plugin and standard permissions.
- **Icons**: ✅ `./assets/images/logo.png`
- **Splash screen**: ✅ Configured correctly.
- **Adaptive icon**: ✅ Configured with background color, foreground, and monochrome image for Android 13+.
- **Version**: ✅ `"version": "1.0.0"`
- **Build number**: ⚠️ **WARNING**: There is no explicit `"versionCode"` under the `android` block in `app.json`. While `eas.json` uses `"autoIncrement": true` for production, having an initial `versionCode: 1` explicitly defined in `app.json` is best practice to prevent initial sync issues with Google Play.

## Conclusion
✅ **PASS (with warnings)**. Configuration is robust and ready for EAS, but missing an explicit `versionCode`.
