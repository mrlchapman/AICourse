const folderCache = new Map<string, { folders: FolderIds; timestamp: number }>();
const FOLDER_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

interface FolderIds {
  rootId: string;
  coursesId: string;
  templatesId: string;
}

export async function findFolder(
  token: string,
  name: string,
  parentId?: string,
  requireOwnedByMe?: boolean
): Promise<string | null> {
  let q = `mimeType = 'application/vnd.google-apps.folder' and name = '${name}' and trashed = false`;
  if (parentId) q += ` and '${parentId}' in parents`;
  if (requireOwnedByMe) q += ` and 'root' in parents`;

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();
  return data.files?.[0]?.id || null;
}

export async function createFolder(token: string, name: string, parentId?: string): Promise<string> {
  const metadata: Record<string, unknown> = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) metadata.parents = [parentId];

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  const data = await res.json();
  return data.id;
}

async function findOrCreateFolder(
  token: string,
  name: string,
  parentId?: string,
  requireOwnedByMe?: boolean
): Promise<string> {
  const existingId = await findFolder(token, name, parentId, requireOwnedByMe);
  if (existingId) return existingId;
  return await createFolder(token, name, parentId);
}

export async function ensureAppFolders(token: string, userId: string): Promise<FolderIds> {
  const cacheKey = `user-${userId}`;
  const cached = folderCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < FOLDER_CACHE_TTL) {
    return cached.folders;
  }

  const rootId = await findOrCreateFolder(token, 'AI Course Creator', undefined, true);

  const [coursesId, templatesId] = await Promise.all([
    findOrCreateFolder(token, 'Courses', rootId),
    findOrCreateFolder(token, 'Activity Templates', rootId),
  ]);

  const folders: FolderIds = { rootId, coursesId, templatesId };
  folderCache.set(cacheKey, { folders, timestamp: Date.now() });

  return folders;
}

export function invalidateFolderCache(userId?: string) {
  if (userId) {
    folderCache.delete(`user-${userId}`);
  } else {
    folderCache.clear();
  }
}
