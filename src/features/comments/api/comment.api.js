import { api } from '../../../lib/axios';

export const commentApi = {
  getComments: async (workspaceId, projectId, taskId, type = 'comment') => {
    const res = await api.get(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments?type=${type}`
    );
    return res.data;
  },

  createComment: async (workspaceId, projectId, taskId, content, type = 'comment') => {
    const res = await api.post(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`,
      { content, type }
    );
    return res.data;
  },

  // ⬇️ NAYA: Attachments ke saath message bhejo
  createCommentWithAttachment: async (
    workspaceId,
    projectId,
    taskId,
    content,
    type = 'comment',
    messageType = 'text',
    attachments = []
  ) => {
    const res = await api.post(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`,
      { content, type, messageType, attachments }
    );
    return res.data;
  },

  deleteComment: async (workspaceId, projectId, taskId, commentId) => {
    await api.delete(
      `/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}`
    );
  }
};