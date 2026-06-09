export interface ProjectMember {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  department: string | null;
  roleInProject: string;
  joinedAt: string;
}

export interface AddMemberRequest {
  userId: string;
  roleInProject?: string;
}
