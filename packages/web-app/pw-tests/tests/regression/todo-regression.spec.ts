import { test, expect } from "../../fixtures";

/**
 * Regression suite for the Todo application.
 *
 * Covers edge cases, filter behaviour, and in-place editing.
 * These run on the nightly scheduled job (regression mode) and on manual triggers.
 * No @smoke tag — excluded from smoke-only runs via --grep-invert @prd-smoke pattern.
 */
test.describe("Todo App — Regression", () => {
  test.describe("Filtering", () => {
    test.beforeEach(async ({ todoPage }) => {
      await todoPage.addMultipleTodos(["Alpha", "Beta", "Gamma"]);
      await todoPage.completeTodo(0); // Mark 'Alpha' as done
    });

    test("Active filter shows only incomplete todos", async ({ todoPage }) => {
      await todoPage.filterActive.click();

      const items = await todoPage.getTodoTexts();
      expect(items).not.toContain("Alpha");
      expect(items).toContain("Beta");
      expect(items).toContain("Gamma");
    });

    test("Completed filter shows only done todos", async ({ todoPage }) => {
      await todoPage.filterCompleted.click();

      const items = await todoPage.getTodoTexts();
      expect(items).toContain("Alpha");
      expect(items).not.toContain("Beta");
    });

    test("All filter restores full list", async ({ todoPage }) => {
      await todoPage.filterCompleted.click();
      await todoPage.filterAll.click();

      const items = await todoPage.getTodoTexts();
      expect(items).toHaveLength(3);
    });
  });

  test.describe("Editing", () => {
    test("can edit an existing todo item", async ({ todoPage }) => {
      await todoPage.addTodo("Old text");
      await todoPage.editTodo(0, "New text");

      const items = await todoPage.getTodoTexts();
      expect(items).toContain("New text");
      expect(items).not.toContain("Old text");
    });
  });

  test.describe("Deletion", () => {
    test("can delete a todo item", async ({ todoPage }) => {
      await todoPage.addMultipleTodos(["Keep me", "Delete me"]);
      await todoPage.deleteTodo(1);

      const items = await todoPage.getTodoTexts();
      expect(items).not.toContain("Delete me");
      expect(items).toContain("Keep me");
    });

    test("Clear completed removes only completed items", async ({
      todoPage,
    }) => {
      await todoPage.addMultipleTodos(["Done", "Active"]);
      await todoPage.completeTodo(0);
      await todoPage.clearCompletedButton.click();

      const items = await todoPage.getTodoTexts();
      expect(items).toHaveLength(1);
      expect(items).toContain("Active");
    });
  });

  test.describe("Persistence", () => {
    test("todos persist after page reload", async ({ todoPage, page }) => {
      await todoPage.addTodo("Should survive reload");
      await page.reload();
      await page.waitForLoadState("domcontentloaded");

      const items = await todoPage.getTodoTexts();
      expect(items).toContain("Should survive reload");
    });
  });
});
