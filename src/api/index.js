// API adapter used by every page; currently it points to the in-memory mock.
// Replace this export with real HTTP-backed methods when the backend is available.
import { mock } from "./mock";
// When the backend is ready, expose matching request(...) methods here instead of mock methods.
export const api = mock;
