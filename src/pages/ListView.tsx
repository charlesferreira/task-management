import type { Project, Task } from '../models/types'
import GlobalTaskList from '../components/GlobalTaskList'

type ListViewProps = {
  projects: Project[]
  tasks: Task[]
  onReorder: (tasks: Task[]) => void
}

const ListView = ({ projects, tasks, onReorder }: ListViewProps) => {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Global Task List
        </h1>
        <p className="text-sm text-slate-500">
          Reordering here updates every project view instantly.
        </p>
      </header>
      <GlobalTaskList projects={projects} tasks={tasks} onReorder={onReorder} />
    </section>
  )
}

export default ListView
