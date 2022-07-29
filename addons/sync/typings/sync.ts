export interface SyncData {
  token: string | null,
  updatedAt: string | null,
}

export interface SyncPlan {
  name: string,
  gist: string,
  directory: string,
  files: string[],
}
