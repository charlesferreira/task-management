import { useState } from 'react'
import { useProjects } from './hooks/useProjects'
import { useTasks } from './hooks/useTasks'
import BoardView from './pages/BoardView'
import ListView from './pages/ListView'

function App() {
  const [activeView, setActiveView] = useState<'board' | 'list'>('board')
  const { projects, createProject, reorderProjects } = useProjects()
  const {
    tasks,
    reorderTasks,
    addTaskAfterProject,
    addTaskAtTop,
    reorderWithinProject,
    setTasks,
  } = useTasks()

  const handleDeleteProject = (projectId: string) => {
    const updatedProjects = reorderProjects(
      projects.filter((project) => project.id !== projectId),
    )
    const updatedTasks = tasks.map((task) =>
      task.projectId === projectId ? { ...task, projectId: null } : task,
    )
    setTasks(updatedTasks)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Task Organizer
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Keep every task in one global order.
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setActiveView('board')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === 'board'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Board view
            </button>
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeView === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Global list
            </button>
          </div>
        </header>

        {activeView === 'board' ? (
          <BoardView
            projects={projects}
            tasks={tasks}
            onAddTask={addTaskAfterProject}
            onCreateProject={createProject}
            onDeleteProject={handleDeleteProject}
            onReorderProjects={reorderProjects}
            onReorderProjectTasks={reorderWithinProject}
          />
        ) : (
          <ListView
            projects={projects}
            tasks={tasks}
            onReorder={reorderTasks}
            onAddTask={addTaskAtTop}
          />
        )}
      </div>
    </div>
  )
}

export default App
