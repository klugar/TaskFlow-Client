import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import type { Project, TaskItem, DashboardStats } from '../types';

const STATUS_LABELS = ['Todo', 'InProgress', 'InReview', 'Done'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get all projects first
      const projectsRes = await api.get<Project[]>('/projects');
      const projects = projectsRes.data;

      // Get tasks for every project, then flatten into one array
      const taskResults = await Promise.all(
        projects.map((p) => api.get<TaskItem[]>(`/tasks/project/${p.id}`))
      );
      const allTasks: TaskItem[] = taskResults.flatMap((r) => r.data);

      // Count tasks per status
      const statusBreakdown = STATUS_LABELS.map((label) => ({
        name: label,
        count: allTasks.filter((t) => t.status === label).length,
      }));

      // Sort by most recently due, only future or undated last
      const dueSoon = [...allTasks]
        .filter((t) => t.dueDate)
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 5);

      // Most recent tasks (assuming higher id = more recent)
      const recentTasks = [...allTasks].sort((a, b) => b.id - a.id).slice(0, 5);

      setStats({
        totalProjects: projects.length,
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter((t) => t.status === 'Done').length,
        statusBreakdown,
        recentTasks,
        dueSoon,
      });
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Total projects</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {stats?.totalProjects}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Total tasks</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">
              {stats?.totalTasks}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-sm text-gray-500">Completed tasks</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {stats?.completedTasks}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Status breakdown chart */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">
              Tasks by status
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats?.statusBreakdown}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-700 mb-4">
              Recent tasks
            </h3>
            {stats?.recentTasks.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks yet.</p>
            ) : (
              <div className="space-y-3">
                {stats?.recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-700">{task.title}</span>
                    <span className="text-xs text-gray-400">{task.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Due soon */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Due soon</h3>
          {stats?.dueSoon.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing due yet.</p>
          ) : (
            <div className="space-y-2">
              {stats?.dueSoon.map((task) => (
                <div
                  key={task.id}
                  className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0"
                >
                  <span className="text-gray-700">{task.title}</span>
                  <span className="text-xs text-gray-400">
                    📅 {new Date(task.dueDate!).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}