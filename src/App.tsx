import { useEffect, useMemo, useState } from 'react'
import { useProjects } from './hooks/useProjects'
import { useTasks } from './hooks/useTasks'
import BoardView from './pages/BoardView'
import ListView from './pages/ListView'
import ZenView from './pages/ZenView'

function App() {
  const [activeView, setActiveView] = useState<'board' | 'list' | 'focused'>(
    'board',
  )
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>(() => {
    const stored = localStorage.getItem('taskOrganizer.filter')
    if (stored === 'active' || stored === 'completed' || stored === 'all') {
      return stored
    }
    return 'all'
  })
  const { projects, createProject, reorderProjects, updateProject } =
    useProjects()
  const {
    tasks,
    reorderVisibleTasks,
    addTaskAfterProject,
    addTaskAtTop,
    moveTaskInBoard,
    toggleComplete,
    deleteTask,
    deleteCompleted,
    updateTaskTitle,
    setTasks,
  } = useTasks()

  useEffect(() => {
    localStorage.setItem('taskOrganizer.filter', filter)
  }, [filter])

  const filteredTasks = useMemo(() => {
    if (filter === 'active') {
      return tasks.filter((task) => !task.completedAt)
    }
    if (filter === 'completed') {
      return tasks.filter((task) => task.completedAt)
    }
    return tasks
  }, [filter, tasks])

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completedAt).length,
    [tasks],
  )
  const focusedTask = useMemo(() => {
    return tasks.find((task) => !task.completedAt) ?? tasks[0] ?? null
  }, [tasks])

  const handleDeleteProject = (projectId: string) => {
    reorderProjects(projects.filter((project) => project.id !== projectId))
    const updatedTasks = tasks.map((task) =>
      task.projectId === projectId ? { ...task, projectId: null } : task,
    )
    setTasks(updatedTasks)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex w-full flex-col gap-6 px-6 py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Task Organizer
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200/70 bg-slate-50 p-1 dark:border-slate-800/70 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setActiveView('board')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeView === 'board'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                Board
              </button>
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeView === 'list'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                Global list
              </button>
              <button
                type="button"
                onClick={() => setActiveView('focused')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeView === 'focused'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                Focused
              </button>
            </div>
            {activeView === 'focused' ? null : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white p-1 dark:border-slate-800/70 dark:bg-slate-900">
                  {(['all', 'active', 'completed'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFilter(mode)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                        filter === mode
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={deleteCompleted}
                  disabled={completedCount === 0}
                  className="rounded-lg border border-slate-200/70 px-2.5 py-1 text-[11px] font-semibold text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800/70 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                >
                  Delete completed
                </button>
              </div>
            )}
          </div>
        </header>

        {activeView === 'focused' ? (
          <ZenView task={focusedTask} onComplete={toggleComplete} />
        ) : activeView === 'board' ? (
          <BoardView
            projects={projects}
            tasks={filteredTasks}
            allTasks={tasks}
            onAddTask={addTaskAfterProject}
            onCreateProject={createProject}
            onDeleteProject={handleDeleteProject}
            onReorderProjects={reorderProjects}
            onReorderProjectTasks={moveTaskInBoard}
            onToggleComplete={toggleComplete}
            onDeleteTask={deleteTask}
            onUpdateTaskTitle={updateTaskTitle}
            onUpdateProject={updateProject}
          />
        ) : (
          <ListView
            projects={projects}
            tasks={filteredTasks}
            onReorder={reorderVisibleTasks}
            onAddTask={addTaskAtTop}
            onToggleComplete={toggleComplete}
            onDeleteTask={deleteTask}
            onUpdateTaskTitle={updateTaskTitle}
          />
        )}
      </div>
    </div>
  )
}

export default App
