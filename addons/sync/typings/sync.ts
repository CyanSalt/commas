export interface SyncData {
  token: string | null,
  gistURL: string | null,
  updatedAt: string | null,
  uploadedAt: string | null,
  downloadedAt: string | null,
}

export interface SyncPlan {
  name: string,
  gist: string,
  directory: string,
  files: string[],
}
