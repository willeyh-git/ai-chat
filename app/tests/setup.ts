import { vi } from 'vitest';

// Mock console methods to avoid polluting output during tests
vi.spyOn(console, 'error').mockImplementation(() => {});
