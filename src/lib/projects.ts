export type Project = {
  id: string
  name: string
  seriesId?: string
  createdAt: string
  updatedAt: string
}

const KEY = 'sw:projects'

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function listProjects(): Project[] {
  const all = safeParse<Project[]>(localStorage.getItem(KEY)) ?? []
  return all.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))
}

export function getProject(id: string): Project | null {
  return listProjects().find((p) => p.id === id) ?? null
}

export function createProject(name: string): Project {
  const now = new Date().toISOString()
  const project: Project = {
    id: `proj_${Date.now().toString(36)}`,
    name,
    createdAt: now,
    updatedAt: now,
  }
  const all = listProjects()
  all.push(project)
  localStorage.setItem(KEY, JSON.stringify(all))
  return project
}

export function updateProject(id: string, patch: Partial<Project>): Project | null {
  const all = listProjects()
  const idx = all.findIndex((p) => p.id === id)
  if (idx < 0) return null
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
  localStorage.setItem(KEY, JSON.stringify(all))
  return all[idx]
}

export function deleteProject(id: string): void {
  const all = listProjects().filter((p) => p.id !== id)
  localStorage.setItem(KEY, JSON.stringify(all))
}
