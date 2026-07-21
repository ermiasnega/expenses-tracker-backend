# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please email security@example.com instead of using the issue tracker.

## Supported Versions

Only the latest version receives security updates.

## Security Best Practices

### Password Security
- Passwords are hashed using bcryptjs with salt rounds of 10
- Never store plain text passwords

### JWT Security
- Use a strong JWT_SECRET
- Set appropriate token expiration (30 days)
- Validate tokens on every protected route

### Database Security
- Use MongoDB connection strings with authentication
- Enable network access restrictions
- Regular backups

### Input Validation
- Validate all user inputs
- Sanitize data before storing
- Use express-validator for validation

### HTTPS
- Always use HTTPS in production
- Implement HSTS headers
- Use Helmet for security headers

### Rate Limiting
- Implement rate limiting for API endpoints
- Prevent brute force attacks

## Security Headers

The application uses Helmet to set security headers:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
