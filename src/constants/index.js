/**
 * ============================================================
 * FRONTEND CONSTANTS
 * ============================================================
 * Mirrors backend enums. Keep in sync when backend changes.
 */

// ---------- API ----------
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// ---------- Workspace roles ----------
export const WORKSPACE_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  GUEST: 'guest',
};

export const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  guest: 'Guest',
};

// ---------- Task enums ----------
export const TASK_STATUS = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
};

export const TASK_STATUS_LABELS = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const PRIORITY_META = {
  low: { label: 'Low', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400' },
  medium: { label: 'Medium', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400' },
  high: { label: 'High', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400' },
  urgent: { label: 'Urgent', color: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400' },
};

// ---------- Project enums ----------
export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

export const PROJECT_STATUS_LABELS = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
  archived: 'Archived',
};

export const PROJECT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// ---------- Socket events ----------
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_WORKSPACE: 'workspace:join',
  LEAVE_WORKSPACE: 'workspace:leave',
  JOIN_PROJECT: 'project:join',
  LEAVE_PROJECT: 'project:leave',
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_MOVED: 'task:moved',
  TASK_ASSIGNED: 'task:assigned',
  COMMENT_CREATED: 'comment:created',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  PROJECT_CREATED: 'project:created',
  PROJECT_UPDATED: 'project:updated',
  WORKSPACE_MEMBER_JOINED: 'workspace:member_joined',
  NOTIFICATION_NEW: 'notification:new',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
};

// ---------- React Query keys ----------
export const QK = {
  me: ['me'],
  workspaces: ['workspaces'],
  workspace: (id) => ['workspace', id],
  workspaceMembers: (id) => ['workspace', id, 'members'],
  workspaceInvites: (id) => ['workspace', id, 'invites'],
  workspaceActivity: (id) => ['workspace', id, 'activity'],
  workspaceAnalytics: (id) => ['workspace', id, 'analytics'],
  projects: (wsId) => ['projects', wsId],
  project: (wsId, id) => ['project', wsId, id],
  tasks: (wsId, projId, filters) => ['tasks', wsId, projId, filters],
  task: (wsId, projId, id) => ['task', wsId, projId, id],
  comments: (wsId, projId, taskId) => ['comments', wsId, projId, taskId],
  taskActivity: (wsId, taskId) => ['activity', wsId, 'task', taskId],
};

// ---------- localStorage keys ----------
export const LS_KEYS = {
  THEME: 'tf_theme',
  ACTIVE_WORKSPACE: 'tf_active_ws',
};

// ---------- Permissions (RBAC 2.0) ----------
export const PERMISSION_LABELS = {
  'task:create': 'Create Tasks',
  'task:update': 'Edit Tasks',
  'task:delete': 'Delete Tasks',
  'task:assign': 'Assign Tasks',
  'project:create': 'Create Projects',
  'project:update': 'Edit Projects',
  'project:delete': 'Delete Projects',
  'member:invite': 'Invite Members',
  'member:remove': 'Remove Members',
  'member:role_update': 'Change Member Roles',
  'workspace:update': 'Update Workspace',
  'workspace:delete': 'Delete Workspace',
};

export const ROLE_PERMISSIONS_MAP = {
  owner: Object.keys(PERMISSION_LABELS),
  admin: [
    'task:create', 'task:update', 'task:delete', 'task:assign',
    'project:create', 'project:update', 'project:delete',
    'member:invite', 'member:remove'
  ],
  member: ['task:create', 'task:update', 'task:assign', 'project:create'],
  guest: [],
};