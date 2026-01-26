import { useEffect, useState } from 'react'
import type { Project } from '../models/types'
import { projectService } from '../services/projectService'

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    setProjects(projectService.getOrInitializeProjects())
  }, [])

  const saveProjects = (next: Project[]) => {
    setProjects(next)
    projectService.saveProjects(next)
  }

  return { projects, setProjects: saveProjects }
}
