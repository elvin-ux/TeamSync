import type { ApiResponse } from "../types/common";
import type { Attachment } from "../types/attachment";
import { api } from "./api";

export const attachmentService = {
  getTaskAttachments: async (taskId: string): Promise<Attachment[]> => {
    const response = await api.get<ApiResponse<Attachment[]>>(`/tasks/${taskId}/attachments`);
    return response.data.data;
  },

  uploadAttachment: async (taskId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<ApiResponse<Attachment>>(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  deleteAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/tasks/${taskId}/attachments/${attachmentId}`);
  },
};
