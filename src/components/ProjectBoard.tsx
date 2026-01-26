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
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Project, Task } from '../models/types'
import { UNASSIGNED_PROJECT } from '../models/types'
import ProjectColumn from './ProjectColumn'

type ProjectBoardProps = {
  projects: Project[]
  tasks: Task[]
  onAddTask: (title: string, projectId: string | null) => void
  onDeleteProject: (projectId: string) => void
  onReorderProjects: (projects: Project[]) => void
  onReorderProjectTasks: (
    projectId: string | null,
    activeId: string,
    overId: string,
  ) => void
}

type SortableProjectColumnProps = {
  project: Project
  tasks: Task[]
  onAddTask: (title: string, projectId: string | null) => void
  onDeleteProject: (projectId: string) => void
  onReorderProjectTasks: (
    projectId: string | null,
    activeId: string,
    overId: string,
  ) => void
}

const SortableProjectColumn = ({
  project,
  tasks,
  onAddTask,
  onDeleteProject,
  onReorderProjectTasks,
}: SortableProjectColumnProps) => {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'z-10' : ''}>
      <ProjectColumn
        project={project}
        tasks={tasks}
        onAddTask={onAddTask}
        onDeleteProject={onDeleteProject}
        onReorderProjectTasks={onReorderProjectTasks}
        dragHandle={
          <button
            type="button"
            ref={setActivatorNodeRef}
            className={`flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-[10px] text-slate-400 transition hover:text-slate-700 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            aria-label="Drag project"
            {...attributes}
            {...listeners}
          >
            ::
          </button>
        }
      />
    </div>
  )
}

const ProjectBoard = ({
  projects,
  tasks,
  onAddTask,
  onDeleteProject,
  onReorderProjects,
  onReorderProjectTasks,
}: ProjectBoardProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const orderedProjects = [...projects].sort((a, b) => a.order - b.order)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return
        const oldIndex = orderedProjects.findIndex(
          (project) => project.id === active.id,
        )
        const newIndex = orderedProjects.findIndex(
          (project) => project.id === over.id,
        )
        if (oldIndex === -1 || newIndex === -1) return
        const updated = [...orderedProjects]
        const [moved] = updated.splice(oldIndex, 1)
        updated.splice(newIndex, 0, moved)
        onReorderProjects(updated)
      }}
    >
      <SortableContext
        items={orderedProjects.map((project) => project.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {orderedProjects.map((project) => {
            const projectTasks = tasks.filter(
              (task) => task.projectId === project.id,
            )
            return (
              <SortableProjectColumn
                key={project.id}
                project={project}
                tasks={projectTasks}
                onAddTask={onAddTask}
                onDeleteProject={onDeleteProject}
                onReorderProjectTasks={onReorderProjectTasks}
              />
            )
          })}
          <ProjectColumn
            project={UNASSIGNED_PROJECT}
            tasks={tasks.filter((task) => task.projectId === null)}
            isUnassigned
            onAddTask={onAddTask}
            onReorderProjectTasks={onReorderProjectTasks}
          />
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default ProjectBoard
