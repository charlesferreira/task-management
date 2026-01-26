import type { Project, Task } from '../models/types'
import ProjectColumn from './ProjectColumn'

type ProjectBoardProps = {
  projects: Project[]
  tasks: Task[]
}

const ProjectBoard = ({ projects, tasks }: ProjectBoardProps) => {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => {
        const projectTasks = tasks.filter(
          (task) => task.projectId === project.id,
        )
        return (
          <ProjectColumn
            key={project.id}
            project={project}
            tasks={projectTasks}
          />
        )
      })}
    </div>
  )
}

export default ProjectBoard
