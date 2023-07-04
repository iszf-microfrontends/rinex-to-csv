import { createEvent, createStore, sample } from 'effector';

import { every, reset } from 'patronum';

import { NavigationOption, NavigationType, TimeStep } from './types';

export const mounted = createEvent();

export const timeStepChanged = createEvent<TimeStep>();
export const navigationOptionChanged = createEvent<NavigationOption>();

export const formSubmitted = createEvent();

export const $timeStep = createStore<TimeStep | null>(null).on(timeStepChanged, (_, value) => value);
export const $timeStepError = createStore<string | null>(null).on(timeStepChanged, () => null);

const initialNavigationOptions: NavigationOption[] = Object.values(NavigationType).map((type) => ({ type, measurements: [] }));
export const $navigationOptions = createStore<NavigationOption[]>(initialNavigationOptions).on(navigationOptionChanged, (state, value) =>
  state.map((option) => {
    if (option.type === value.type) {
      return {
        ...option,
        ...value,
      };
    }
    return option;
  }),
);

const $formValid = every({ stores: [$timeStepError], predicate: null });

reset({
  clock: mounted,
  target: [$timeStep, $timeStepError, $navigationOptions],
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
});

$timeStep.watch((value) => {
  console.log(`timeStep state: ${value}`);
});

$timeStepError.watch((value) => {
  console.log(`timeStepError state: ${value}`);
});

$navigationOptions.watch((value) => {
  console.log(`navigationOptions state: ${JSON.stringify(value)}`);
});
