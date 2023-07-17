import { createEffect } from 'effector';

export type DownloadFileOptions = {
  output: string;
  content: ArrayBuffer;
};

export const readFileAsArrayBufferFx = createEffect<File, { file: File; arrayBuffer: ArrayBuffer }>(async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  return {
    file,
    arrayBuffer,
  };
});

export const downloadFileFx = createEffect<DownloadFileOptions, void>((options: DownloadFileOptions) => {
  const blob = new Blob([options.content], { type: 'application/octet-stream' });
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = options.output;
  link.click();

  URL.revokeObjectURL(blobUrl);
});
