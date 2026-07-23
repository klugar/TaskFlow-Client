export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  dueDate: string | null;
  memberCount: number;
  taskCount: number;
}

export interface CreateProjectDto {
  name: string;
  description: string;
  dueDate: string | null;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: number;
  assignedToName: string | null;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  priority: number;  // ← change from string to number
  dueDate: string | null;
  projectId: number;
}


export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  statusBreakdown: { name: string; count: number }[];
  recentTasks: TaskItem[];
  dueSoon: TaskItem[];
}