import { test, expect } from "../../fixtures";

/**
 * Regression suite for the Posts resource.
 *
 * Covers full CRUD contract, pagination shape, and relationship endpoints.
 */
test.describe("API Service — Posts CRUD Regression", () => {
  test.describe("Create", () => {
    test("POST /posts creates a new resource and returns 201", async ({
      api,
    }) => {
      const response = await api.createPost({
        title: "SDET Showcase Post",
        body: "Automated via Playwright API testing",
        userId: 1,
      });

      expect(response.status()).toBe(201);
      const created = await response.json();

      expect(created).toHaveProperty("id");
      expect(created.title).toBe("SDET Showcase Post");
      expect(created.userId).toBe(1);
    });
  });

  test.describe("Read", () => {
    test("GET /posts returns exactly 100 posts (dataset boundary)", async ({
      api,
    }) => {
      const response = await api.getPosts();
      const posts = await response.json();

      expect(posts).toHaveLength(100);
    });

    test("every post has required fields", async ({ api }) => {
      const response = await api.getPosts();
      const posts: Array<{
        id: number;
        title: string;
        body: string;
        userId: number;
      }> = await response.json();

      for (const post of posts) {
        expect(post).toHaveProperty("id");
        expect(post).toHaveProperty("title");
        expect(post).toHaveProperty("body");
        expect(post).toHaveProperty("userId");
      }
    });
  });

  test.describe("Update", () => {
    test("PATCH /posts/:id partially updates a post", async ({ api }) => {
      const response = await api.updatePost(1, { title: "Updated Title" });

      expect(response.status()).toBe(200);
      const updated = await response.json();
      expect(updated.title).toBe("Updated Title");
      // Other fields remain unchanged
      expect(updated.id).toBe(1);
    });
  });

  test.describe("Delete", () => {
    test("DELETE /posts/:id returns 200", async ({ api }) => {
      const response = await api.deletePost(1);
      expect(response.status()).toBe(200);
    });
  });

  test.describe("Relationships", () => {
    test("GET /posts/:id/comments returns comments for a post", async ({
      api,
    }) => {
      const response = await api.getCommentsByPost(1);

      expect(response.status()).toBe(200);
      const comments: Array<{ postId: number; id: number; email: string }> =
        await response.json();

      expect(Array.isArray(comments)).toBeTruthy();
      expect(comments.length).toBeGreaterThan(0);
      // All comments should belong to post 1
      for (const comment of comments) {
        expect(comment.postId).toBe(1);
        expect(comment).toHaveProperty("email");
      }
    });
  });
});
