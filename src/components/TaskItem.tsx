import type { Project, Task } from '../models/types'
import ProjectBadge from './ProjectBadge'

type TaskItemProps = {
  task: Task
  project: Project
}

const TaskItem = ({ task, project }: TaskItemProps) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{task.title}</p>
      <ProjectBadge project={project} />
    </div>
  )
}

export default TaskItem
