import type { APIRoute } from 'astro';
import { createList, getList, addUrlToList, updateUrl, deleteUrl, deleteList, getAllLists } from '../../utils/url-list';

export const GET: APIRoute = async ({ url }) => {
  try {
    const customUrl = url.searchParams.get('id');
    if (customUrl) {
      const list = await getList(customUrl);
      if (!list) {
        return new Response(JSON.stringify({ error: 'List not found' }), { status: 404 });
      }
      return new Response(JSON.stringify(list));
    }
    
    const lists = await getAllLists();
    return new Response(JSON.stringify(lists));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { customUrl } = body;
    const list = await createList(customUrl);
    return new Response(JSON.stringify(list), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { listId, url } = body;
    const newUrl = await addUrlToList(listId, url);
    return new Response(JSON.stringify(newUrl));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { urlId, newUrl } = body;
    const updated = await updateUrl(urlId, newUrl);
    return new Response(JSON.stringify(updated));
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  try {
    const urlId = url.searchParams.get('urlId');
    const customUrl = url.searchParams.get('listId');
    
    if (urlId) {
      await deleteUrl(parseInt(urlId));
      return new Response(null, { status: 204 });
    }
    
    if (customUrl) {
      await deleteList(customUrl);
      return new Response(null, { status: 204 });
    }
    
    return new Response(JSON.stringify({ error: 'Missing urlId or listId parameter' }), { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};