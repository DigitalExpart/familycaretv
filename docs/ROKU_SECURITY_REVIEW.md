# Roku Device Linking Security Review

This document outlines the security posture of the current Roku Device Linking implementation, identifying critical vulnerabilities, severity levels, and recommended fixes prior to production launch.

## 1. Code Entropy
* **Risk**: The linking code generation (`Math.random().toString(36).substring(2, 8)`) relies on a non-cryptographically secure pseudo-random number generator (PRNG).
* **Severity**: **High**
* **Recommendation**: Replace `Math.random()` with Node's native `crypto.randomBytes` or `crypto.randomInt` to ensure cryptographically secure entropy. 

## 2. Expiration Handling
* **Risk**: Expiration is set to 15 minutes, which is standard. However, expired codes are passively deleted only when accessed.
* **Severity**: **Low**
* **Recommendation**: Implement a CRON job or rely on Prisma's scheduled cleanup to prune expired rows proactively, preventing database bloat if a malicious actor generates millions of unlinked codes.

## 3. Replay Protection
* **Risk**: The shortcode length (6 characters) is vulnerable to brute-force attacks if an attacker rapidly submits guesses to `POST /roku/link-device`.
* **Severity**: **Critical**
* **Recommendation**: Implement strict rate limiting on `POST /roku/link-device` (e.g., maximum 5 attempts per user IP/ID per 15 minutes). 

## 4. One-Time Usage
* **Risk**: The system correctly deletes the `DeviceLink` immediately upon successful token generation inside `getToken()`. This enforces strict one-time usage.
* **Severity**: **None**
* **Recommendation**: The current implementation is secure.

## 5. User Ownership Validation
* **Risk**: The `linkDevice` method securely extracts the `userId` from the protected JWT Guard. 
* **Severity**: **None**
* **Recommendation**: Ensure the mobile app requires explicit user confirmation ("Are you sure you want to link this TV?") before calling the endpoint to prevent social engineering attacks.

## 6. JWT Issuance Security
* **Risk**: The Roku device receives the exact same JWT footprint as a Mobile app. If a user loses access to a public Roku TV (e.g., an Airbnb), revoking the Roku token might require revoking all mobile tokens as well.
* **Severity**: **Medium**
* **Recommendation**: Inject a `device: 'roku'` claim into the JWT payload specifically for tokens issued via the `getToken()` endpoint. This allows targeted token revocation and analytics.

## 7. Rate Limiting
* **Risk**: Endpoints `/roku/device-code` and `/roku/link-device` lack Throttler protection.
* **Severity**: **High**
* **Recommendation**: Apply `@Throttle()` decorators using `@nestjs/throttler` to prevent abuse. 

## 8. Abuse Prevention (Collisions)
* **Risk**: The `code` column is marked `@unique`. An attacker automating `/roku/device-code` can easily saturate the 36^6 namespace, causing database `UniqueConstraint` errors and resulting in Denial of Service (DoS) for legitimate users.
* **Severity**: **High**
* **Recommendation**: Increase code entropy length to 8 characters for a much larger namespace, and restrict `/roku/device-code` to 1 generation per IP address per minute.
