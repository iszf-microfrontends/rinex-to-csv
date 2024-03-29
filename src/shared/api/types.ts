export type TimeStep = 10 | 30 | 60 | 120;

export enum NavigationMeasurement {
  L1C = 'L1C',
  C1C = 'C1C',
  L2I = 'L2I',
  C2I = 'C2I',
}

export enum NavigationSystem {
  GPS = 'GPS',
  GLONASS = 'GLONASS',
  GALILEO = 'Galileo',
  BEI_DOU = 'BeiDou',
  SBAS = 'SBAS',
}

export enum NavigationType {
  G_SIGNALS = 'g_signals',
  R_SIGNALS = 'r_signals',
  E_SIGNALS = 'e_signals',
  C_SIGNALS = 'c_signals',
  S_SIGNALS = 's_signals',
}

export interface NavigationOption {
  type: NavigationType;
  measurements: NavigationMeasurement[];
}

export interface UploadRinexResponse {
  filename: string;
  proc_id: string;
}

export interface UploadNavResponse extends UploadRinexResponse {}

export interface CalculateBody {
  [NavigationType.G_SIGNALS]: NavigationMeasurement[];
  [NavigationType.R_SIGNALS]: NavigationMeasurement[];
  [NavigationType.E_SIGNALS]: NavigationMeasurement[];
  [NavigationType.C_SIGNALS]: NavigationMeasurement[];
  [NavigationType.S_SIGNALS]: NavigationMeasurement[];
  timestep: TimeStep;
}
