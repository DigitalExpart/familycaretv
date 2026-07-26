"""
Roku App Validation Test
========================
Checks for the response field mismatch bug and validates HTTPS/SSL configuration.
"""
import os
import re
import sys
import urllib.request
import ssl

ROKU_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'roku')
API_URL = "https://carefree-endurance-production-7621.up.railway.app"

passed = 0
failed = 0
warnings = 0

def test_pass(msg):
    global passed
    passed += 1
    print(f"  PASS: {msg}")

def test_fail(msg):
    global failed
    failed += 1
    print(f"  FAIL: {msg}")

def test_warn(msg):
    global warnings
    warnings += 1
    print(f"  WARN: {msg}")

# TEST 1: No 'statusCode' in screen/scene files that use ApiTask
print("\nTEST 1: Response field name consistency (statusCode vs code)")
print("-" * 60)

for dirpath, dirnames, filenames in os.walk(ROKU_DIR):
    for fname in filenames:
        if not fname.endswith('.brs'):
            continue
        fpath = os.path.join(dirpath, fname)
        rel = os.path.relpath(fpath, ROKU_DIR)
        
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        if fname == 'ApiTask.brs':
            continue
        
        if fname == 'PollingTask.brs':
            if 'res.statusCode' in content and 'statusCode: code' in content:
                test_pass(f"{rel}: uses own ExecuteApiRequest with statusCode (correct)")
            continue
        
        if 'statusCode' in content:
            for i, line in enumerate(content.splitlines(), 1):
                if 'statusCode' in line and 'res.' in line:
                    test_fail(f"{rel}:{i} -- still uses 'res.statusCode' (should be 'res.code')")
        elif '.code' in content and ('res.code' in content or 'response.code' in content):
            test_pass(f"{rel}: uses correct field name (.code)")

# TEST 2: Config uses HTTPS
print(f"\nTEST 2: HTTPS configuration")
print("-" * 60)

config_path = os.path.join(ROKU_DIR, 'source', 'Config.brs')
with open(config_path, 'r', encoding='utf-8') as f:
    config_content = f.read()

if 'http://' in config_content:
    test_fail("Config.brs contains plain http:// URL")
elif 'https://' in config_content:
    test_pass("Config.brs uses https:// for API base URL")

# TEST 3: SSL certificate configuration
print(f"\nTEST 3: SSL certificate configuration")
print("-" * 60)

for check_file in ['components/tasks/ApiTask.brs', 'components/managers/PollingTask.brs']:
    fpath = os.path.join(ROKU_DIR, check_file.replace('/', os.sep))
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        if 'SetCertificatesFile("common:/certs/ca-bundle.crt")' in content:
            test_pass(f"{check_file}: SetCertificatesFile configured")
        else:
            test_fail(f"{check_file}: missing SetCertificatesFile call")
        if 'InitClientCertificates()' in content:
            test_pass(f"{check_file}: InitClientCertificates configured")
        else:
            test_fail(f"{check_file}: missing InitClientCertificates call")

# TEST 4: No plain http:// URLs
print(f"\nTEST 4: No unencrypted HTTP URLs in codebase")
print("-" * 60)

http_found = False
for dirpath, dirnames, filenames in os.walk(ROKU_DIR):
    for fname in filenames:
        if not fname.endswith('.brs'):
            continue
        fpath = os.path.join(dirpath, fname)
        rel = os.path.relpath(fpath, ROKU_DIR)
        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
            for i, line in enumerate(f, 1):
                if 'http://' in line and not line.strip().startswith("'"):
                    test_fail(f"{rel}:{i} -- contains unencrypted http:// URL")
                    http_found = True

if not http_found:
    test_pass("No unencrypted http:// URLs found in any .brs file")

# TEST 5: API endpoint reachability
print(f"\nTEST 5: API endpoint reachability (HTTPS)")
print("-" * 60)

try:
    ctx = ssl.create_default_context()
    req = urllib.request.Request(f"{API_URL}/health", headers={"Accept": "application/json"})
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        body = resp.read().decode()
        if resp.status == 200 and 'ok' in body:
            test_pass(f"API /health returns 200 OK over HTTPS")
        else:
            test_fail(f"API /health returned status {resp.status}: {body[:100]}")
except Exception as e:
    test_fail(f"API /health unreachable: {e}")

# TEST 6: Manifest validation
print(f"\nTEST 6: Manifest validation")
print("-" * 60)

manifest_path = os.path.join(ROKU_DIR, 'manifest')
if os.path.exists(manifest_path):
    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = f.read()
    for field in ['title', 'major_version', 'minor_version', 'build_version', 'ui_resolutions']:
        if f"{field}=" in manifest:
            test_pass(f"Manifest has required field: {field}")
        else:
            test_fail(f"Manifest missing required field: {field}")

# TEST 7: Required files exist
print(f"\nTEST 7: Required directories and files")
print("-" * 60)

for rpath in ['manifest', 'source/Main.brs', 'source/Config.brs', 'source/RegistryService.brs',
              'components/tasks/ApiTask.brs', 'components/tasks/ApiTask.xml',
              'components/scenes/MainScene.brs', 'components/scenes/HomeScene.brs',
              'components/scenes/DeviceLinkScene.brs', 'components/scenes/SplashScene.brs']:
    fpath = os.path.join(ROKU_DIR, rpath.replace('/', os.sep))
    if os.path.exists(fpath):
        test_pass(f"Found: {rpath}")
    else:
        test_fail(f"Missing: {rpath}")

# SUMMARY
print(f"\n{'=' * 60}")
print(f"  RESULTS: {passed} passed, {failed} failed, {warnings} warnings")
print(f"{'=' * 60}")

if failed > 0:
    print("  VALIDATION FAILED -- fix the issues above before deploying")
    sys.exit(1)
else:
    print("  ALL TESTS PASSED -- safe to package and deploy")
    sys.exit(0)
