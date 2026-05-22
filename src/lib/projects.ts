import { supabase } from './supabase'

export type Project = {
  id: string
  name: string
  seriesId?: string
  createdAt: string
  updatedAt: string
}

type ProjectRow = {
  id: string
  name: string
  series_id: string | null
  created_at: string
  updated_at: string
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    seriesId: row.series_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw new Error(`listProjects: ${error.message}`)
  return (data ?? []).map((r) => rowToProject(r as ProjectRow))
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`getProject: ${error.message}`)
  return data ? rowToProject(data as ProjectRow) : null
}

export async function createProject(name: string): Promise<Project> {
  const id = `proj_${Date.now().toString(36)}`
  const { data, error } = await supabase
    .from('projects')
    .insert({ id, name })
    .select()
    .single()
  if (error) throw new Error(`createProject: ${error.message}`)
  return rowToProject(data as ProjectRow)
}

export async function updateProject(
  id: string,
  patch: Partial<Project>,
): Promise<Project | null> {
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (patch.name !== undefined) update.name = patch.name
  if (patch.seriesId !== undefined) update.series_id = patch.seriesId

  const { data, error } = await supabase
    .from('projects')
    .update(update)
    .eq('id', id)
    .select()
    .maybeSingle()
  if (error) throw new Error(`updateProject: ${error.message}`)
  return data ? rowToProject(data as ProjectRow) : null
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(`deleteProject: ${error.message}`)
}
