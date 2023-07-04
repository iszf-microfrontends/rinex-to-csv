import { NavigationMeasurement, NavigationSystem, NavigationType, TimeStep } from './types';

export const timeSteps: TimeStep[] = [10, 30, 60, 120];

export const timeStepData: { label: string; value: string }[] = timeSteps.map((timeStep) => ({
  label: `${timeStep} сек.`,
  value: String(timeStep),
}));

export const navigationSystems: { type: NavigationType; label: NavigationSystem }[] = [
  {
    type: NavigationType.G_SIGNALS,
    label: NavigationSystem.GPS,
  },
  {
    type: NavigationType.R_SIGNALS,
    label: NavigationSystem.GLONASS,
  },
  {
    type: NavigationType.E_SIGNALS,
    label: NavigationSystem.GALILEO,
  },
  {
    type: NavigationType.C_SIGNALS,
    label: NavigationSystem.BEI_DOU,
  },
  {
    type: NavigationType.S_SIGNALS,
    label: NavigationSystem.SBAS,
  },
];

export const navigationMeasurements = Object.values(NavigationMeasurement);
