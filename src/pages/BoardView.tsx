import type { Project, Task } from '../models/types'
import ProjectBoard from '../components/ProjectBoard'

type BoardViewProps = {
  projects: Project[]
  tasks: Task[]
}

const BoardView = ({ projects, tasks }: BoardViewProps) => {
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Project Board
          </h1>
          <p className="text-sm text-slate-500">
            Tasks are grouped by project using the global order.
          </p>
        </div>
      </header>
      <ProjectBoard projects={projects} tasks={tasks} />
    </section>
  )
}

export default BoardView
