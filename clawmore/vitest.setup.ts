import { vi } from 'vitest';

// Set required env vars before any module imports
process.env.DYNAMO_TABLE = 'test-table';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:8886';
process.env.SES_FROM_EMAIL = 'test@example.com';

// Next's virtual `server-only` import is not available in the test environment.
// Mock it as a no-op so server-only imports don't fail in unit tests.
vi.mock('server-only', () => ({}));
