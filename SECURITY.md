# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously at VectorBase. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email your findings to security@vectorbase.dev (or open a private security advisory on GitHub)
3. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Assessment**: We will investigate and assess the vulnerability within 7 days
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days
- **Disclosure**: We will coordinate with you on public disclosure timing

### Safe Harbor

We consider security research conducted in accordance with this policy to be:

- Authorized and lawful
- Helpful to the security of VectorBase
- Exempt from any legal action from us

We will not pursue legal action against researchers who:

- Act in good faith
- Avoid privacy violations and data destruction
- Do not exploit vulnerabilities beyond proof-of-concept
- Report vulnerabilities promptly

## Security Best Practices for Users

### API Keys

- Never commit API keys to version control
- Rotate API keys regularly
- Use environment variables for all sensitive configuration
- Set appropriate expiration dates on API keys

### Self-Hosted Deployments

- Keep your VectorBase installation updated
- Use HTTPS in production
- Secure your database with strong passwords
- Limit network access to your PostgreSQL instance
- Enable and configure rate limiting
- Review and restrict CORS settings for your use case

### Environment Variables

- Never commit `.env` files to version control
- Use `.env.example` as a template (no real values)
- In production, use secure secret management (e.g., Vercel Environment Variables, AWS Secrets Manager)

## Known Security Considerations

### Data Storage

- All embeddings and document content are stored in PostgreSQL
- API keys are hashed before storage (only prefix is stored in plain text)
- User authentication is handled by Supabase Auth

### Third-Party Services

VectorBase integrates with:

- **OpenAI**: For embeddings and chat completions (data is sent to OpenAI's API)
- **Supabase**: For authentication and database hosting
- **Stripe**: For payment processing (if using SaaS version)

Review the privacy policies and security practices of these services for your compliance requirements.

## Updates

This security policy may be updated from time to time. Please check back periodically for updates.

---

Thank you for helping keep VectorBase and its users safe!
