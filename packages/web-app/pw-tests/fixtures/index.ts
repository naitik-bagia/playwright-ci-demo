import { test as base } from "@playwright/test";
import { TodoPage } from "../pages/TodoPage";

/**
 * Custom fixture set for web-app tests.
 *
 * Extending Playwright's base test with pre-constructed page objects
 * removes boilerplate from individual test files and ensures each test
 * starts from a clean, well-typed page instance.
 */
type WebAppFixtures = {
  todoPage: TodoPage;
};

export const test = base.extend<WebAppFixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.navigate();
    await use(todoPage);
  },
});

export { expect } from "@playwright/test";
