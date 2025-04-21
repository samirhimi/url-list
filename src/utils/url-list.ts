import { query } from './db';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

interface URL {
  id: number;
  url: string;
  title?: string;
  description?: string;
  position: number;
}

interface URLList {
  id: number;
  custom_url: string;
  urls: URL[];
}

export async function createList(customUrl?: string): Promise<URLList> {
  const generatedUrl = customUrl || nanoid();
  const result = await query(
    'INSERT INTO url_lists (custom_url) VALUES ($1) RETURNING *',
    [generatedUrl]
  );
  return { ...result.rows[0], urls: [] };
}

export async function getList(customUrl: string): Promise<URLList | null> {
  const result = await query(
    'SELECT l.*, u.id as url_id, u.url, u.title, u.description, u.position FROM url_lists l LEFT JOIN urls u ON l.id = u.list_id WHERE l.custom_url = $1 ORDER BY u.position',
    [customUrl]
  );
  
  if (result.rows.length === 0) return null;
  
  const urls = result.rows
    .filter(row => row.url_id)
    .map(row => ({
      id: row.url_id,
      url: row.url,
      title: row.title,
      description: row.description,
      position: row.position
    }));
    
  return {
    id: result.rows[0].id,
    custom_url: result.rows[0].custom_url,
    urls
  };
}

export async function addUrlToList(listId: number, url: string): Promise<URL> {
  const position = (await query(
    'SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM urls WHERE list_id = $1',
    [listId]
  )).rows[0].next_pos;
  
  const result = await query(
    'INSERT INTO urls (list_id, url, position) VALUES ($1, $2, $3) RETURNING *',
    [listId, url, position]
  );
  return result.rows[0];
}

export async function updateUrl(urlId: number, newUrl: string): Promise<URL> {
  const result = await query(
    'UPDATE urls SET url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [newUrl, urlId]
  );
  return result.rows[0];
}

export async function deleteUrl(urlId: number): Promise<void> {
  await query('DELETE FROM urls WHERE id = $1', [urlId]);
}

export async function deleteList(customUrl: string): Promise<void> {
  await query('DELETE FROM url_lists WHERE custom_url = $1', [customUrl]);
}

export async function getAllLists(): Promise<URLList[]> {
  const result = await query(
    'SELECT l.*, u.id as url_id, u.url, u.title, u.description, u.position FROM url_lists l LEFT JOIN urls u ON l.id = u.list_id ORDER BY l.created_at DESC, u.position'
  );
  
  const listMap = new Map<number, URLList>();
  
  result.rows.forEach(row => {
    if (!listMap.has(row.id)) {
      listMap.set(row.id, {
        id: row.id,
        custom_url: row.custom_url,
        urls: []
      });
    }
    
    if (row.url_id) {
      listMap.get(row.id)?.urls.push({
        id: row.url_id,
        url: row.url,
        title: row.title,
        description: row.description,
        position: row.position
      });
    }
  });
  
  return Array.from(listMap.values());
}