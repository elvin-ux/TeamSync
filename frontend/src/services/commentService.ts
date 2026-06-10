import type { ApiResponse } from "../types/common";
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from "../types/comment";
import { api } from "./api";

export const commentService = {
  getTaskComments: async (taskId: string): Promise<Comment[]> => {
    const response = await api.get<ApiResponse<Comment[]>>(`/comments/task/${taskId}`);
    return response.data.data;
  },

  createComment: async (data: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post<ApiResponse<Comment>>("/comments", data);
    return response.data.data;
  },

  updateComment: async (commentId: string, data: UpdateCommentRequest): Promise<Comment> => {
    const response = await api.put<ApiResponse<Comment>>(`/comments/${commentId}`, data);
    return response.data.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/comments/${commentId}`);
  },
};
