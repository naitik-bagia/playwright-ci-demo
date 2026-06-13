import { test, expect } from "../../fixtures";

/**
 * @smoke
 *
 * API health and contract checks — fastest possible signal that the
 * service is up and responding with the expected shape.
 * Runs on every scheduled CI run.
 */
test.describe("API Service — Health @smoke", () => {
  test("GET /posts returns 200 with an array @smoke", async ({ api }) => {
    const response = await api.getPosts();

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test("GET /posts/:id returns a single post with correct shape @smoke", async ({
    api,
  }) => {
    const response = await api.getPost(1);

    expect(response.status()).toBe(200);
    const post = await response.json();

    // Contract check — all required fields must be present
    expect(post).toHaveProperty("id");
    expect(post).toHaveProperty("title");
    expect(post).toHaveProperty("body");
    expect(post).toHaveProperty("userId");
    expect(post.id).toBe(1);
  });

  test("GET /users returns 200 with a non-empty array @smoke", async ({
    api,
  }) => {
    const response = await api.getUsers();

    expect(response.status()).toBe(200);
    const users = await response.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.length).toBeGreaterThan(0);
  });

  test("GET /posts/:id returns 404 for non-existent resource @smoke", async ({
    api,
  }) => {
    const response = await api.getPost(99999);
    // JSONPlaceholder returns 404 for resources beyond its dataset
    expect(response.status()).toBe(404);
  });
});
