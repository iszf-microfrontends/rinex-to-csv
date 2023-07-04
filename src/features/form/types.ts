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

export type NavigationOption = { type: NavigationType; measurements: NavigationMeasurement[] };
