import type { Project, Task } from '../models/types'

type ProjectColumnProps = {
  project: Project
  tasks: Task[]
}

const ProjectColumn = ({ project, tasks }: ProjectColumnProps) => {
  return (
    <div className="flex min-h-[240px] flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h3 className="text-sm font-semibold text-slate-900">
            {project.name}
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-6 text-center text-xs text-slate-500">
            No tasks yet
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 shadow-sm"
            >
              {task.title}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProjectColumn
