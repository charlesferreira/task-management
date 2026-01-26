import type { Project } from '../models/types'

type ProjectBadgeProps = {
  project: Project
}

const ProjectBadge = ({ project }: ProjectBadgeProps) => {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: project.color }}
      />
      {project.name}
    </span>
  )
}

export default ProjectBadge
