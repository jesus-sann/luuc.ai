## Description
<!-- Provide a brief description of the changes in this PR -->


## Type of Change
<!-- Mark the relevant option with an 'x' -->

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring (no functional changes)
- [ ] Dependency update

## Related Issues
<!-- Link to related issues: Fixes #123, Related to #456 -->


## Changes Made
<!-- List the specific changes made in this PR -->

-
-
-

## Testing
<!-- Describe how you tested these changes -->

### Manual Testing
- [ ] Tested locally in development mode
- [ ] Tested the production build locally

### Automated Testing
- [ ] Added/updated unit tests
- [ ] All existing tests pass
- [ ] Test coverage maintained or improved

### Test Coverage
```bash
# Run and paste coverage results here
npm run test:coverage
```

## Screenshots/Videos
<!-- If applicable, add screenshots or videos to demonstrate the changes -->


## Checklist
<!-- Mark completed items with an 'x' -->

### Code Quality
- [ ] Code follows the project's style guidelines
- [ ] Self-review completed
- [ ] Code commented where necessary (especially complex logic)
- [ ] No console.log statements left in code
- [ ] No commented-out code blocks
- [ ] ESLint passes (`npm run lint`)
- [ ] TypeScript compiles without errors (`npm run type-check`)

### Testing
- [ ] Tests added for new features/bug fixes
- [ ] All tests pass (`npm test`)
- [ ] Test coverage is adequate
- [ ] Edge cases considered and tested

### Documentation
- [ ] Updated README if needed
- [ ] Updated relevant documentation in `/docs`
- [ ] Added JSDoc comments for new functions/components
- [ ] Updated `.env.example` if new env variables added

### Security
- [ ] No sensitive data (API keys, passwords, etc.) in code
- [ ] Input validation added where necessary
- [ ] No new security vulnerabilities introduced
- [ ] Followed security best practices from SECURITY.md

### Performance
- [ ] No obvious performance regressions
- [ ] Large operations use proper loading states
- [ ] Database queries optimized (if applicable)
- [ ] Images/assets optimized (if applicable)

### UI/UX (if applicable)
- [ ] Responsive design works on mobile
- [ ] Accessible (keyboard navigation, ARIA labels)
- [ ] Works in major browsers (Chrome, Firefox, Safari)
- [ ] Loading states implemented
- [ ] Error states handled gracefully

## Environment Variables
<!-- List any new environment variables and their purpose -->

- [ ] No new environment variables
- [ ] New environment variables documented in `.env.example`

**New Variables:**
```
VARIABLE_NAME=description_of_what_it_does
```

## Database Changes
<!-- If this PR includes database changes, describe them -->

- [ ] No database changes
- [ ] Database migration included
- [ ] Migration tested locally
- [ ] Rollback plan documented

## Breaking Changes
<!-- If this introduces breaking changes, describe them and the migration path -->

- [ ] No breaking changes
- [ ] Breaking changes documented below

**Breaking Changes:**


**Migration Path:**


## Deployment Notes
<!-- Special instructions for deployment, if any -->

- [ ] No special deployment steps needed
- [ ] Requires environment variable updates (see above)
- [ ] Requires database migration
- [ ] Other (explain below):


## Reviewer Notes
<!-- Any specific areas you want reviewers to focus on? -->


## Post-Merge Tasks
<!-- Tasks to complete after this PR is merged -->

- [ ] None
- [ ] Update Vercel environment variables
- [ ] Run database migrations
- [ ] Notify team of breaking changes
- [ ] Other:


---

## Review Guidelines for Reviewers

When reviewing this PR, please check:

1. **Code Quality:** Is the code clean, readable, and maintainable?
2. **Tests:** Are there adequate tests? Do they cover edge cases?
3. **Security:** Are there any security concerns?
4. **Performance:** Are there any performance implications?
5. **Documentation:** Is the code well-documented?
6. **Architecture:** Does this fit with the overall architecture?
