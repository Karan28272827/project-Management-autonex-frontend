import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { allocationApi, parentProjectApi, subProjectApi } from '../../services/api';
import { FolderKanban, Settings, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getPmEmployeeId, getPmProjects, getPmSubProjects } from '../../utils/pmScope';

const PMSubProjectsPage = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const pmEmployeeId = getPmEmployeeId(user);
    const [searchParams] = useSearchParams();
    const projectParam = searchParams.get('project');
    const filterMainProjectId = projectParam ? Number(projectParam) : null;

    const { data: subProjects = [], isLoading } = useQuery({
        queryKey: ['sub-projects'],
        queryFn: subProjectApi.getAll,
    });
    const { data: parentProjects = [] } = useQuery({
        queryKey: ['parent-projects'],
        queryFn: parentProjectApi.getAll,
    });
    const { data: allocations = [] } = useQuery({
        queryKey: ['allocations'],
        queryFn: allocationApi.getAll,
    });

    const scopedProjects = getPmProjects(parentProjects, pmEmployeeId);
    const scopedSubProjects = getPmSubProjects(subProjects, parentProjects, pmEmployeeId, allocations);
    const filteredSubProjects = filterMainProjectId == null || Number.isNaN(filterMainProjectId)
        ? scopedSubProjects
        : scopedSubProjects.filter((project) => project.main_project_id === filterMainProjectId);
    const currentProject = scopedProjects.find((project) => project.id === filterMainProjectId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {currentProject ? `Sub-Projects for ${currentProject.name}` : 'Sub-Projects'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Daily sheets belonging to your PM projects
                    </p>
                </div>
                <Link
                    to="/pm/projects"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium text-sm rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    Projects
                </Link>
            </div>

            {filteredSubProjects.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">No sub-projects found</p>
                    <p className="text-sm text-slate-400 mt-1">Sub-projects from your projects will appear here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Sub-Project</th>
                                    <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Project</th>
                                    <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Manpower</th>
                                    <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Tasks</th>
                                    <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Timeline</th>
                                    <th className="px-5 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredSubProjects.map((project) => {
                                    const parentProject = scopedProjects.find((item) => item.id === project.main_project_id);
                                    const allocated = allocations.filter((allocation) => allocation.sub_project_id === project.id).length;

                                    return (
                                        <tr key={project.id}>
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-800">{project.name}</div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    {project.client || parentProject?.project_type || 'Sub-project'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">{parentProject?.name || 'Unlinked'}</td>
                                            <td className="px-5 py-4 text-center">
                                                <div className="inline-flex items-center gap-1.5 text-slate-600">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span>{allocated}/{project.required_manpower || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center text-slate-700">{project.total_tasks || 0}</td>
                                            <td className="px-5 py-4">
                                                <div className="inline-flex items-center gap-1.5 text-slate-600">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span>
                                                        {project.start_date && project.end_date
                                                            ? `${format(new Date(project.start_date), 'MMM d')} - ${format(new Date(project.end_date), 'MMM d')}`
                                                            : '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${project.project_status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : project.project_status === 'completed'
                                                            ? 'bg-blue-50 text-blue-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {project.project_status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PMSubProjectsPage;
