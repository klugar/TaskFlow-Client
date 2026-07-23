import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import type { Project, CreateProjectDto } from '../types';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateProjectDto>({
    name: '',
    description: '',
    dueDate: null,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get<Project[]>('/projects');
      setProjects(response.data);
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };


  
  const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await api.post('/projects', form);
    setForm({ name: '', description: '', dueDate: null });
    setShowForm(false);
    fetchProjects();
    toast.success('Project created!');
  } catch {
    toast.error('Failed to create project.');
  }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            {showForm ? 'Cancel' : '+ New Project'}
          </button>
        </div>

        {/* Create Project Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">New Project</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Project name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <input
                type="date"
                value={form.dueDate || ''}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Create Project
              </button>
            </form>
          </div>
        )}

        {/* Projects List */}
        {loading ? (
          <p className="text-gray-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>No projects yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start"
              >
                <div>
                  <h3
                    className="font-semibold text-gray-800 text-lg cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/projects/${project.id}/tasks`)}
                  >
                    {project.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {project.description}
                  </p>
                  <div className="flex gap-4 mt-3 text-xs text-gray-400">
                    <span>📌 {project.taskCount} tasks</span>
                    <span>👥 {project.memberCount} members</span>
                    {project.dueDate && (
                      <span>
                        📅 Due{' '}
                        {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-red-400 hover:text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}