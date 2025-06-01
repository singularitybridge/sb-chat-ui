# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

The Singularity Bridge Chat UI team and community take security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

To report a security issue, please use the GitHub Security Advisory ["Report a Vulnerability"](../../security/advisories/new) tab.

The team will send a response indicating the next steps in handling your report. After the initial reply to your report, the security team will keep you informed of the progress towards a fix and full announcement, and may ask for additional information or guidance.

Report security bugs in third-party modules to the person or team maintaining the module.

## Security Best Practices

When deploying Singularity Bridge Chat UI in production:

1. **Environment Variables**: Never commit API keys, tokens, or credentials to version control
2. **Authentication**: Implement proper authentication and authorization
3. **HTTPS**: Always serve the application over HTTPS in production
4. **Dependencies**: Regularly update dependencies to patch known vulnerabilities
5. **Build Process**: Use trusted build processes and verify integrity
6. **Content Security Policy**: Implement appropriate CSP headers
7. **Input Validation**: Validate all user inputs on both client and server sides
8. **XSS Protection**: Sanitize user-generated content properly

## Frontend-Specific Security Considerations

### Cross-Site Scripting (XSS)
- Always sanitize user inputs and outputs
- Use React's built-in protections against XSS
- Be careful with `dangerouslySetInnerHTML`
- Validate and sanitize data from APIs

### Authentication Tokens
- Store authentication tokens securely
- Implement proper token expiration and refresh
- Never expose sensitive tokens in client-side code

### Third-Party Dependencies
- Regular audit of npm packages
- Use tools like `npm audit` to check for vulnerabilities
- Keep dependencies updated

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. We recommend:

- Subscribe to repository notifications to be notified of security updates
- Regularly update to the latest version
- Review the changelog for security-related fixes

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine the affected versions
2. Audit code to find any potential similar problems
3. Prepare fixes for all releases still under maintenance
4. Release new versions as soon as possible

## Comments on this Policy

If you have suggestions on how this process could be improved please submit a pull request.
