import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * TodoPage — Page Object for the TodoMVC demo application.
 *
 * Encapsulates all selectors and interactions. Tests never touch raw locators;
 * they only call methods on this class, keeping tests readable and resilient
 * to selector changes.
 */
export class TodoPage extends BasePage {
  readonly newTodoInput: Locator;
  readonly todoList: Locator;
  readonly todoCount: Locator;
  readonly clearCompletedButton: Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;

  constructor(page: Page) {
    super(page);
    this.newTodoInput = page.getByPlaceholder("What needs to be done?");
    this.todoList = page.getByTestId("todo-item");
    this.todoCount = page.locator(".todo-count");
    this.clearCompletedButton = page.getByRole("button", {
      name: "Clear completed",
    });
    this.filterAll = page.getByRole("link", { name: "All" });
    this.filterActive = page.getByRole("link", { name: "Active" });
    this.filterCompleted = page.getByRole("link", { name: "Completed" });
  }

  /** Navigate to the TodoMVC app. */
  async navigate() {
    await this.goto("/");
  }

  /** Add a single todo item. */
  async addTodo(text: string) {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press("Enter");
  }

  /** Add multiple todo items in sequence. */
  async addMultipleTodos(items: string[]) {
    for (const item of items) {
      await this.addTodo(item);
    }
  }

  /** Mark the todo at a given index (0-based) as complete. */
  async completeTodo(index: number) {
    const toggle = this.todoList
      .nth(index)
      .getByRole("checkbox", { name: "Toggle Todo" });
    await toggle.check();
  }

  /** Delete the todo at a given index by hovering to reveal the × button. */
  async deleteTodo(index: number) {
    const item = this.todoList.nth(index);
    await item.hover();
    await item.getByRole("button", { name: "Delete" }).click();
  }

  /** Edit a todo item in-place. */
  async editTodo(index: number, newText: string) {
    await this.todoList.nth(index).dblclick();
    const editInput = this.todoList.nth(index).getByRole("textbox");
    await editInput.fill(newText);
    await editInput.press("Enter");
  }

  /** Get the text of all visible todo items. */
  async getTodoTexts(): Promise<string[]> {
    return this.todoList.allTextContents();
  }

  /** Get the number shown in the item counter (e.g. "3 items left"). */
  async getRemainingCount(): Promise<string> {
    return (await this.todoCount.textContent()) ?? "";
  }
}
