## Purpose

GitHub OAuth authentication, the visitor/trusted/owner role model, and admin management of the trusted-user allow-list.

## Requirements

### Requirement: GitHub OAuth Sign-In
The system SHALL allow a user to authenticate using GitHub OAuth, establishing a session tied to their GitHub username.

#### Scenario: Successful sign-in
- **WHEN** a user completes the GitHub OAuth flow successfully
- **THEN** the system creates a session associated with their GitHub username

#### Scenario: Cancelled or failed sign-in
- **WHEN** a user cancels or fails the GitHub OAuth flow
- **THEN** the system does not create a session and the user remains unauthenticated

### Requirement: Role Resolution
The system SHALL resolve every request to exactly one role — `visitor`, `trusted`, or `owner` — based on authentication state and allow-list membership.

#### Scenario: Unauthenticated request
- **WHEN** a request has no valid session
- **THEN** the system resolves the role as `visitor`

#### Scenario: Authenticated as configured owner
- **WHEN** a request has a valid session whose GitHub username matches the configured owner username
- **THEN** the system resolves the role as `owner`

#### Scenario: Authenticated as an allow-listed trusted user
- **WHEN** a request has a valid session whose GitHub username is present in the trusted-users allow-list
- **THEN** the system resolves the role as `trusted`

#### Scenario: Authenticated but not owner or allow-listed
- **WHEN** a request has a valid session whose GitHub username is neither the configured owner nor present in the trusted-users allow-list
- **THEN** the system resolves the role as `visitor`

### Requirement: Trusted-User Allow-List Management
The system SHALL allow only the `owner` role to add or remove GitHub usernames from the trusted-users allow-list.

#### Scenario: Owner adds a trusted user
- **WHEN** the `owner` submits a GitHub username to add to the allow-list
- **THEN** the system stores the username and subsequent sign-ins by that username resolve to the `trusted` role

#### Scenario: Owner removes a trusted user
- **WHEN** the `owner` removes a GitHub username from the allow-list
- **THEN** subsequent sign-ins by that username no longer resolve to the `trusted` role

#### Scenario: Non-owner attempts to modify the allow-list
- **WHEN** a request with role `visitor` or `trusted` attempts to add or remove an allow-list entry
- **THEN** the system rejects the request and makes no change to the allow-list
