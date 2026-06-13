import { APIRequestContext, APIResponse } from "@playwright/test";

/**
 * ApiClient — thin wrapper around Playwright's APIRequestContext.
 *
 * Provides typed helpers for each resource endpoint, handles common
 * headers, and centralises base URL resolution so tests stay free of
 * raw string paths.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  // ─── Posts ───────────────────────────────────────────────────────────────

  async getPosts(): Promise<APIResponse> {
    return this.request.get("/posts");
  }

  async getPost(id: number): Promise<APIResponse> {
    return this.request.get(`/posts/${id}`);
  }

  async createPost(body: {
    title: string;
    body: string;
    userId: number;
  }): Promise<APIResponse> {
    return this.request.post("/posts", { data: body });
  }

  async updatePost(
    id: number,
    body: Partial<{ title: string; body: string; userId: number }>
  ): Promise<APIResponse> {
    return this.request.patch(`/posts/${id}`, { data: body });
  }

  async deletePost(id: number): Promise<APIResponse> {
    return this.request.delete(`/posts/${id}`);
  }

  // ─── Users ───────────────────────────────────────────────────────────────

  async getUsers(): Promise<APIResponse> {
    return this.request.get("/users");
  }

  async getUser(id: number): Promise<APIResponse> {
    return this.request.get(`/users/${id}`);
  }

  // ─── Comments ────────────────────────────────────────────────────────────

  async getCommentsByPost(postId: number): Promise<APIResponse> {
    return this.request.get(`/posts/${postId}/comments`);
  }
}
