import { attach, createEvent, createStore, merge, sample } from 'effector';
import { combineEvents, every, reset, status } from 'patronum';
import { type MouseEvent } from 'react';

import { api, NavigationType } from '~/shared/api';
import { type CalculateBody, type NavigationOption, type TimeStep } from '~/shared/api';
import { downloadFileFx, errorNotified, readFileAsArrayBufferFx, type DownloadFileOptions, type NotifyOptions } from '~/shared/lib';

const readRinexFileAsArrayBufferFx = attach({ effect: readFileAsArrayBufferFx });
const readNavFileAsArrayBufferFx = attach({ effect: readFileAsArrayBufferFx });
const downloadResultFx = attach({ effect: downloadFileFx });

const uploadRinexFileFx = attach({ effect: api.uploadRinexFileFx });
const uploadNavFileFx = attach({ effect: api.uploadNavFileFx });
const calculateFx = attach({ effect: api.calculateFx });
const getResultFx = attach({ effect: api.getResultFx });

export const mounted = createEvent();

export const rinexFileChanged = createEvent<File>();
const rinexFileUploaded = combineEvents({ events: [rinexFileChanged, uploadRinexFileFx.doneData] });

export const navFileChanged = createEvent<File>();
const navFileUploaded = combineEvents({ events: [navFileChanged, uploadNavFileFx.doneData] });

export const navigationOptionChanged = createEvent<NavigationOption>();

export const timeStepChanged = createEvent<TimeStep>();

export const downloadResultPressed = createEvent<MouseEvent>();

export const formSubmitted = createEvent();
const formChanged = merge([rinexFileUploaded, navFileUploaded, navigationOptionChanged, timeStepChanged]);

export const $rinexFile = createStore<File | null>(null).on(rinexFileUploaded, (_, [file]) => file);
export const $rinexFileError = createStore<string | null>(null).on([rinexFileChanged, uploadRinexFileFx.done], () => null);
export const $isRinexFileLoading = uploadRinexFileFx.pending;

export const $navFile = createStore<File | null>(null).on(navFileUploaded, (_, [file]) => file);
export const $navFileError = createStore<string | null>(null).on([navFileChanged, uploadNavFileFx.done], () => null);
export const $isNavFileLoading = uploadNavFileFx.pending;

const initialNavigationOptions: NavigationOption[] = Object.values(NavigationType).map((type) => ({ type, measurements: [] }));
export const $navigationOptions = createStore<NavigationOption[]>(initialNavigationOptions).on(navigationOptionChanged, (state, value) =>
  state.map((option) => (option.type === value.type ? { ...option, ...value } : option)),
);
export const $navigationOptionsError = createStore<string | null>(null).on(navigationOptionChanged, () => null);

export const $timeStep = createStore<TimeStep | null>(null).on(timeStepChanged, (_, value) => value);
export const $timeStepError = createStore<string | null>(null).on(timeStepChanged, () => null);

const $calculateStatus = status({ effect: calculateFx }).reset([formChanged, mounted]);
export const $isCalculating = $calculateStatus.map((status) => status === 'pending');

export const $isDownloadResultDisabled = $calculateStatus.map((status) => status !== 'done');
export const $isResultDownloading = downloadResultFx.pending;

const $formValid = every({ stores: [$rinexFileError, $navFileError, $navigationOptionsError, $timeStepError], predicate: null });

reset({
  clock: mounted,
  target: [$rinexFile, $rinexFileError, $navFile, $navFileError, $navigationOptions, $navigationOptionsError, $timeStep, $timeStepError],
});

sample({ clock: rinexFileChanged, target: readRinexFileAsArrayBufferFx });

sample({
  clock: readRinexFileAsArrayBufferFx.doneData,
  fn: ({ file, arrayBuffer }) => {
    const blob = new Blob([new Uint8Array(arrayBuffer)], { type: 'application/octet-stream' });
    const formData = new FormData();
    formData.append('rinex', blob, file.name);
    return formData;
  },
  target: uploadRinexFileFx,
});

sample({
  clock: uploadRinexFileFx.fail,
  fn: (): NotifyOptions => ({
    title: 'Ошибка!',
    message: 'Произошла ошибка при загрузке rinex файла',
  }),
  target: errorNotified,
});

sample({ clock: navFileChanged, target: readNavFileAsArrayBufferFx });

sample({
  clock: readNavFileAsArrayBufferFx.doneData,
  fn: ({ file, arrayBuffer }) => {
    const blob = new Blob([new Uint8Array(arrayBuffer)], { type: 'application/octet-stream' });
    const formData = new FormData();
    formData.append('rinex', blob, file.name);
    return formData;
  },
  target: uploadNavFileFx,
});

sample({
  clock: uploadNavFileFx.fail,
  fn: (): NotifyOptions => ({
    title: 'Ошибка!',
    message: 'Произошла ошибка при загрузке nav файла',
  }),
  target: errorNotified,
});

sample({ clock: downloadResultPressed, target: getResultFx });

sample({
  clock: getResultFx.doneData,
  fn: (responder): DownloadFileOptions => ({ output: `rinex-to-csv.zip`, content: responder.data }),
  target: downloadResultFx,
});

sample({
  clock: formSubmitted,
  source: $rinexFile,
  fn: (file) => {
    if (file === null) {
      return 'Rinex файл обязательный';
    }
    return null;
  },
  target: $rinexFileError,
});

sample({
  clock: formSubmitted,
  source: $navFile,
  fn: (file) => {
    if (file === null) {
      return 'Nav файл обязательный';
    }
    return null;
  },
  target: $navFileError,
});

sample({
  clock: formSubmitted,
  source: $navigationOptions,
  fn: (options) => {
    const atLeastOneSelected = options.some(({ measurements }) => measurements.length > 0);
    if (!atLeastOneSelected) {
      return 'Обязательно выбрать хотя бы одну опцию';
    }
    return null;
  },
  target: $navigationOptionsError,
});

sample({
  clock: formSubmitted,
  source: $timeStep,
  fn: (timeStep) => {
    if (timeStep === null) {
      return 'Временный промежуток обязательный';
    }
    return null;
  },
  target: $timeStepError,
});

sample({
  clock: formSubmitted,
  source: { timeStep: $timeStep, navigationOptions: $navigationOptions },
  filter: $formValid,
  fn: ({ timeStep, navigationOptions }) => {
    const result = navigationOptions.reduce((acc, option) => ({ ...acc, [option.type]: option.measurements }), {});
    return {
      ...result,
      timestep: timeStep,
    } as CalculateBody;
  },
  target: calculateFx,
});

sample({
  clock: calculateFx.fail,
  fn: (): NotifyOptions => ({
    title: 'Ошибка!',
    message: 'Произошла ошибка при расчете координат',
  }),
  target: errorNotified,
});

if (__DEV__) {
  $rinexFile.watch((value) => {
    console.log(`rinexFile ${value?.name}`);
  });

  $navFile.watch((value) => {
    console.log(`navFile ${value?.name}`);
  });

  $timeStep.watch((value) => {
    console.log(`timeStep ${value}`);
  });

  $timeStepError.watch((value) => {
    console.log(`timeStepError ${value}`);
  });

  $navigationOptions.watch((value) => {
    console.log(`navigationOptions ${JSON.stringify(value)}`);
  });
}
