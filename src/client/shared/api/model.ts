import { createEffect } from 'effector';

import { request, Responder } from './request';
import { CalculateBody, UploadNavResponse, UploadRinexResponse } from './types';

export const uploadRinexFileFx = createEffect<FormData, Responder<UploadRinexResponse>>((formData) =>
  request({
    path: 'upload_rinex',
    method: 'POST',
    body: formData,
    contentType: 'auto',
    responseType: 'stream',
  }),
);

export const uploadNavFileFx = createEffect<FormData, Responder<UploadNavResponse>>((formData) =>
  request({
    path: 'upload_nav',
    method: 'POST',
    body: formData,
    contentType: 'auto',
    responseType: 'stream',
  }),
);

export const calculateFx = createEffect<CalculateBody, Responder<unknown>>((body) =>
  request({
    path: 'run',
    method: 'POST',
    body,
    responseType: 'stream',
  }),
);

export const getResultFx = createEffect<void, Responder<ArrayBuffer>>(() =>
  request({ path: 'get_result', method: 'GET', responseType: 'arraybuffer' }),
);
