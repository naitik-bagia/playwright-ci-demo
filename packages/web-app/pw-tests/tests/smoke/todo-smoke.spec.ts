import { test, expect } from "../../fixtures";

/**
 * @smoke
 *
 * Critical path checks for the Todo application.
 * These run on every scheduled CI run and must complete quickly (< 60s total).
 * Tag: @smoke — selected via --grep "@smoke" in the CI workflow.
 */
test.describe("Todo App — Smoke @smoke", () => {
  test("page loads and shows input field", async ({ todoPage }) => {
    await expect(todoPage.newTodoInput).toBeVisible();
    await expect(todoPage.newTodoInput).toHaveAttribute(
      "placeholder",
      "What needs to be done?"
    );
  });

  test("can add a single todo item @smoke", async ({ todoPage }) => {
    await todoPage.addTodo("Buy groceries");

    const items = await todoPage.getTodoTexts();
    expect(items).toContain("Buy groceries");
  });

  test("item counter updates after adding todos @smoke", async ({
    todoPage,
  }) => {
    await todoPage.addMultipleTodos(["Task A", "Task B", "Task C"]);

    const count = await todoPage.getRemainingCount();
    expect(count).toMatch("3");
  });

  test("can mark a todo as completed @smoke", async ({ todoPage }) => {
    await todoPage.addTodo("Finish the report");
    await todoPage.completeTodo(0);

    const completedItem = todoPage.todoList.nth(0);
    await expect(completedItem).toHaveClass(/completed/);
  });
});
