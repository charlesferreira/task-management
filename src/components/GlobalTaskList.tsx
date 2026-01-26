import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo } from 'react'
import type { Project, Task } from '../models/types'
import TaskItem from './TaskItem'

type GlobalTaskListProps = {
  tasks: Task[]
  projects: Project[]
  onReorder: (tasks: Task[]) => void
}

type SortableTaskItemProps = {
  task: Task
  project: Project
}

const SortableTaskItem = ({ task, project }: SortableTaskItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
      {...attributes}
      {...listeners}
    >
      <TaskItem task={task} project={project} />
    </div>
  )
}

const GlobalTaskList = ({ tasks, projects, onReorder }: GlobalTaskListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const projectMap = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project]))
  }, [projects])

  const handleDragEnd = ({
    active,
    over,
  }: {
    active: { id: string }
    over: { id: string } | null
  }) => {
    if (!over || active.id === over.id) return
    const oldIndex = tasks.findIndex((task) => task.id === active.id)
    const newIndex = tasks.findIndex((task) => task.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const next = arrayMove(tasks, oldIndex, newIndex)
    onReorder(next)
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Global Task List</h2>
      <p className="mt-1 text-sm text-slate-500">
        Drag tasks to reorder across all projects.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-5 flex flex-col gap-3">
            {tasks.map((task) => {
              const project = projectMap.get(task.projectId)
              if (!project) return null
              return (
                <SortableTaskItem key={task.id} task={task} project={project} />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default GlobalTaskList
