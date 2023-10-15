import { createEffect } from 'effector';

import { request, type Responder } from './request';
import { type CalculateBody, type UploadNavResponse, type UploadRinexResponse } from './types';

export const uploadRinexFileFx = createEffect<FormData, Responder<UploadRinexResponse>>(async (formData) =>
  request({
    path: 'upload_rinex',
    method: 'POST',
    body: formData,
    contentType: 'auto',
    responseType: 'stream',
  }),
);

export const uploadNavFileFx = createEffect<FormData, Responder<UploadNavResponse>>(async (formData) =>
  request({
    path: 'upload_nav',
    method: 'POST',
    body: formData,
    contentType: 'auto',
    responseType: 'stream',
  }),
);

export const calculateFx = createEffect<CalculateBody, Responder<unknown>>(async (body) =>
  request({
    path: 'run',
    method: 'POST',
    body,
    responseType: 'stream',
  }),
);

export const getResultFx = createEffect<void, Responder<ArrayBuffer>>(async () =>
  request({ path: 'get_result', method: 'GET', responseType: 'arraybuffer' }),
);
