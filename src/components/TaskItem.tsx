import type { ReactNode } from 'react'
import type { Project, Task } from '../models/types'
import ProjectBadge from './ProjectBadge'

type TaskItemProps = {
  task: Task
  project: Project
  dragHandle?: ReactNode
}

const TaskItem = ({ task, project, dragHandle }: TaskItemProps) => {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {dragHandle}
        <p className="text-sm font-semibold text-slate-900">{task.title}</p>
      </div>
      <ProjectBadge project={project} />
    </div>
  )
}

export default TaskItem
