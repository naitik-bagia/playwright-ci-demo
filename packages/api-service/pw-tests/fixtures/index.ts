import { test as base } from "@playwright/test";
import { ApiClient } from "../client/ApiClient";

/**
 * Custom fixtures for api-service tests.
 *
 * Injects a pre-configured ApiClient so every test gets
 * a fresh request context without boilerplate setup.
 */
type ApiFixtures = {
  api: ApiClient;
};

export const test = base.extend<ApiFixtures>({
  api: async ({ request }, use) => {
    const api = new ApiClient(request);
    await use(api);
  },
});

export { expect } from "@playwright/test";
