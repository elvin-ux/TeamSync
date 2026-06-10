export interface Attachment {
  id: string;
  taskId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
}
