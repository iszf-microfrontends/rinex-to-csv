import { BACKEND_URL } from '~/shared/config';

export type ContentType = 'application/json' | 'multipart/form-data' | 'auto';

export type ResponseType = 'json' | 'arraybuffer' | 'stream';

export interface RequestOptions<T> {
  path: string;
  method: 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH';
  body?: T;
  headers?: Record<string, string>;
  contentType?: ContentType;
  responseType?: ResponseType;
}

export interface Responder<T> {
  ok: boolean;
  data: T;
  status: number;
}

const contentIs = (headers: Headers, type: ContentType): boolean => headers.get('Content-Type') === type;

const parseResponse = async <T extends ResponseType>(response: Response, type: T): Promise<any> => {
  if (type === 'stream') {
    return response.text();
  }
  if (type === 'arraybuffer') {
    return response.arrayBuffer();
  }
  return response.json();
};

export const request = async <B = unknown, D = unknown>(options: RequestOptions<B>): Promise<Responder<D>> => {
  const headers = new Headers({
    'Content-Type': options.contentType ?? 'application/json',
    ...options.headers,
  });
  if (options.contentType === 'auto') {
    headers.delete('Content-Type');
  }

  const body = contentIs(headers, 'application/json') ? JSON.stringify(options.body) : (options.body as any);
  const response = await fetch(`${BACKEND_URL}/${options.path}`, {
    method: options.method,
    body,
    headers,
    credentials: 'include',
  });

  const data: D = await parseResponse(response, options.responseType ?? 'json');
  const responder: Responder<D> = {
    ok: response.ok,
    data,
    status: response.status,
  };

  if (!responder.ok) {
    throw responder;
  }

  return responder;
};
