import { env } from '~client/shared/config';

type ContentType = 'application/json' | 'multipart/form-data' | 'auto';

type ResponseType = 'json' | 'arraybuffer' | 'stream';

export type RequestOptions<T> = {
  path: string;
  method: 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH';
  body?: T;
  headers?: Record<string, string>;
  contentType?: ContentType;
  responseType?: ResponseType;
};

export type Responder<T> = {
  ok: boolean;
  data: T;
  status: number;
};

export const request = async <RequestBody = unknown, ResponseData = unknown>(options: RequestOptions<RequestBody>) => {
  const headers = new Headers({
    'Content-Type': options.contentType ?? 'application/json',
    ...options.headers,
  });

  if (options.contentType === 'auto') {
    headers.delete('Content-Type');
  }

  const body = contentIs(headers, 'application/json') ? JSON.stringify(options.body) : (options.body as any);

  const response = await fetch(`${env.BACKEND_URL}/${env.BACKEND_NAME}/${options.path}`, {
    method: options.method,
    body,
    headers,
    credentials: 'include',
  });

  const data: ResponseData = await parseResponse(response, options.responseType ?? 'json');

  const responder: Responder<ResponseData> = {
    ok: response.ok,
    data,
    status: response.status,
  };

  if (!responder.ok) {
    throw responder;
  }

  return responder;
};

function contentIs(headers: Headers, type: ContentType) {
  return headers.get('Content-Type') === type;
}

function parseResponse(response: Response, type: ResponseType) {
  if (type === 'stream') {
    return response.text();
  }
  if (type === 'arraybuffer') {
    return response.arrayBuffer();
  }
  return response.json();
}
