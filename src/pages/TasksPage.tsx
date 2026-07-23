import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { TaskItem, CreateTaskDto } from '../types';
import toast from 'react-hot-toast';

const PRIORITIES = [
  { label: 'Low', value: 0 },
  { label: 'Medium', value: 1 },
  { label: 'High', value: 2 },
  { label: 'Critical', value: 3 },
];

const STATUSES = [
  { label: 'Todo', value: 0 },
  { label: 'InProgress', value: 1 },
  { label: 'InReview', value: 2 },
  { label: 'Done', value: 3 },
];

const statusColors: Record<string, string> = {
  Todo: 'bg-gray-100 text-gray-600',
  InProgress: 'bg-blue-100 text-blue-600',
  InReview: 'bg-yellow-100 text-yellow-600',
  Done: 'bg-green-100 text-green-600',
};

const priorityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-500',
  Medium: 'bg-blue-100 text-blue-500',
  High: 'bg-orange-100 text-orange-500',
  Critical: 'bg-red-100 text-red-500',
};

export default function TasksPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTaskDto>({
    title: '',
    description: '',
    priority: 1,
    dueDate: null,
    projectId: Number(projectId),
  });

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const response = await api.get<TaskItem[]>(`/tasks/project/${projectId}`);
      setTasks(response.data);
    } catch {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await api.post('/tasks', form);
    setForm({
      title: '',
      description: '',
      priority: 1,
      dueDate: null,
      projectId: Number(projectId),
    });
    setShowForm(false);
    fetchTasks();
    toast.success('Task created!');
    } catch {
      toast.error('Failed to create task.');
    }
  };

  const handleStatusChange = async (taskId: number, statusValue: number) => {
  try {
    await api.patch(`/tasks/${taskId}/status`, { status: statusValue });
    fetchTasks();
    toast.success('Status updated!');
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    fetchTasks();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">TaskFlow</h1>
        <button
          onClick={() => navigate('/projects')}
          className="text-sm text-gray-500 hover:underline"
        >
          ← Back to Projects
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            {showForm ? 'Cancel' : '+ New Task'}
          </button>
        </div>

        {/* Create Task Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">New Task</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Task title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex gap-3">
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={form.dueDate || ''}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Create Task
              </button>
            </form>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">✅</p>
            <p>No tasks yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-500 text-sm mt-1">{task.description}</p>
                    )}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status] || 'bg-gray-100'}`}>
                        {task.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority] || 'bg-gray-100'}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-400">
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.assignedToName && (
                        <span className="text-xs text-gray-400">
                          👤 {task.assignedToName}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-400 hover:text-red-600 text-sm ml-4"
                  >
                    Delete
                  </button>
                </div>

                {/* Status updater */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  <span className="text-xs text-gray-400 self-center">Move to:</span>
                  {STATUSES.filter((s) => s.label !== task.status).map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(task.id, status.value)}
                      className="text-xs px-3 py-1 rounded-full border border-gray-200 hover:border-blue-400 hover:text-blue-600 transition"
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}