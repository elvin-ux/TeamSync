export interface ProjectSearchDto {
  id: string;
  name: string;
  description: string;
}

export interface TaskSearchDto {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  status: string;
}

export interface MemberSearchDto {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export interface CommentSearchDto {
  id: string;
  content: string;
  taskId: string;
  taskTitle: string;
  projectId: string;
  authorName: string;
}

export interface SearchResponse {
  projects: ProjectSearchDto[];
  tasks: TaskSearchDto[];
  members: MemberSearchDto[];
  comments: CommentSearchDto[];
}
