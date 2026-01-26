import type { Project } from '../models/types'

type ProjectBadgeProps = {
  project: Project
}

const ProjectBadge = ({ project }: ProjectBadgeProps) => {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: project.color }}
      />
      {project.name}
    </span>
  )
}

export default ProjectBadge
