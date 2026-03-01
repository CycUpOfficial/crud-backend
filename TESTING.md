# Test Guide

This project uses Jest with a shared test DB. Tests must be isolated and avoid multi-call flows.

## Core Rules

- One API call per test. Build the state with factories instead of chaining endpoints.
- Do not access Prisma directly in tests. Use factories and helpers.
- Use `API_PREFIX` from `src/test/helpers/helper.js` for routes.
- Keep test data unique with `makeTestEmail()` / `makeTestUsername()` patterns.

## Setup Pattern

- Auth headers: use `createAuthContext()`.
- DB setup: use factories in `src/test/helpers/factories.js`.
- Avoid direct `prisma.*` in test files.

## Common Helpers

From `src/test/helpers/factories.js`:
- `createUser()`
- `createSession()`
- `createVerificationPin()`
- `createPasswordResetToken()`
- `createItem()`
- `findSessionByToken()`
- `findUserById()`
- `findPasswordResetTokenByToken()`

From `src/test/helpers/helper.js`:
- `API_PREFIX`
- `createAuthContext()`

## Examples

### Auth test with one API call

```js
const { user, pinCode } = await createUserWithVerificationPin();
const username = makeTestUsername();

const res = await request(app)
  .post(`${API_PREFIX}/auth/verify`)
  .send({
    email: user.email,
    pinCode,
    username,
    password: "SecurePass123!",
    passwordConfirmation: "SecurePass123!"
  })
  .set("Accept", "application/json");
```

### Profile test with authenticated user

```js
const auth = await createAuthContext();

const res = await request(app)
  .get(`${API_PREFIX}/users/profile`)
  .set(auth.headers);
```

## Running Tests

- Full suite: `npm run test`
- Single file: `npm run test -- testPathPatternfile`

## Notes

- The suite is configured to run serially (`maxWorkers: 1`) to prevent DB races.
- If you want parallel tests later, switch to per-worker DBs with `JEST_WORKER_ID`.
