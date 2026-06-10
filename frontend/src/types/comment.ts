export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  taskId: string;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
