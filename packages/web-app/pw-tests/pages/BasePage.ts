import { Page, Locator } from "@playwright/test";

/**
 * BasePage
 *
 * All page objects extend this class. It centralises common navigation,
 * waiting helpers, and shared utilities so individual page objects stay lean.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to a path relative to the configured baseURL. */
  async goto(path = "/") {
    await this.page.goto(path);
    await this.page.waitForLoadState("domcontentloaded");
  }

  /** Wait for an element to be visible before interacting. */
  async waitForVisible(locator: Locator, timeout = 10_000) {
    await locator.waitFor({ state: "visible", timeout });
  }

  /** Grab current page title. */
  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
