import { FileInput, Icon, Button } from '@iszf-microfrontends/shared-ui';
import { Box, Checkbox, Group, Select, Stack, Text } from '@mantine/core';
import { useUnit } from 'effector-react';
import { useEffect } from 'react';

import { type NavigationMeasurement, type NavigationOption, type NavigationType, type TimeStep } from '~/shared/api';

import { fileAccept, navigationMeasurementData, navigationSystemData, timeStepData } from './config';
import {
  $isCalculating,
  $isDownloadResultDisabled,
  $isNavFileLoading,
  $isResultDownloading,
  $isRinexFileLoading,
  $navFile,
  $navFileError,
  $navigationOptions,
  $navigationOptionsError,
  $rinexFile,
  $rinexFileError,
  $timeStep,
  $timeStepError,
  downloadResultPressed,
  formSubmitted,
  mounted,
  navFileChanged,
  navigationOptionChanged,
  rinexFileChanged,
  timeStepChanged,
} from './model';

const RinexFileInput = (): JSX.Element => {
  const [rinexFile, rinexFileError, isRinexFileLoading] = useUnit([$rinexFile, $rinexFileError, $isRinexFileLoading]);

  return (
    <FileInput
      required
      accept={fileAccept}
      label="Файл rinex"
      placeholder="Загрузить файл"
      icon={<Icon type="upload" />}
      value={rinexFile}
      error={rinexFileError}
      loading={isRinexFileLoading}
      onChange={(value) => {
        if (value) {
          rinexFileChanged(value);
        }
      }}
    />
  );
};

const NavFileInput = (): JSX.Element => {
  const [navFile, navFileError, isNavFileLoading] = useUnit([$navFile, $navFileError, $isNavFileLoading]);

  return (
    <FileInput
      required
      accept={fileAccept}
      label="Файл nav"
      placeholder="Загрузить файл"
      icon={<Icon type="upload" />}
      value={navFile}
      error={navFileError}
      loading={isNavFileLoading}
      onChange={(value) => {
        if (value) {
          navFileChanged(value);
        }
      }}
    />
  );
};

const NavigationSystemCheckboxGroups = (): JSX.Element => {
  const [navigationOptions, navigationOptionsError] = useUnit([$navigationOptions, $navigationOptionsError]);

  const findNavigationOptionByType = (type: NavigationType): NavigationOption | undefined =>
    navigationOptions.find((option) => option.type === type);

  const checkboxGroups = navigationSystemData.map((system) => (
    <Checkbox.Group
      key={system.type}
      label={system.label}
      value={findNavigationOptionByType(system.type)?.measurements}
      onChange={(value) => {
        navigationOptionChanged({ type: system.type, measurements: value as NavigationMeasurement[] });
      }}
    >
      <Group mt="xs">
        {navigationMeasurementData.map((measurement) => (
          <Checkbox key={measurement} label={measurement} value={measurement} />
        ))}
      </Group>
    </Checkbox.Group>
  ));

  return (
    <div>
      <Text size="sm" fw={500}>
        Опции для расчета: <span style={{ color: 'red' }}>*</span>
      </Text>
      <Stack spacing="xs">{checkboxGroups}</Stack>
      {navigationOptionsError && (
        <Text size="xs" c="red" mt="xs">
          {navigationOptionsError}
        </Text>
      )}
    </div>
  );
};

const TimeStepSelect = (): JSX.Element => {
  const [timeStep, timeStepError] = useUnit([$timeStep, $timeStepError]);

  return (
    <Select
      required
      label="Временной промежуток"
      placeholder="Выберите временной промежуток"
      value={`${timeStep}`}
      data={timeStepData}
      error={timeStepError}
      onChange={(value) => {
        if (value) {
          timeStepChanged(+value as TimeStep);
        }
      }}
    />
  );
};

const DownloadResult = (): JSX.Element => {
  const [isDownloadResultDisabled, isResultDownloading] = useUnit([$isDownloadResultDisabled, $isResultDownloading]);

  return (
    <Button
      tooltip="Сперва нужно рассчитать координаты"
      disabled={isDownloadResultDisabled}
      loading={isResultDownloading}
      onClick={downloadResultPressed}
    >
      Скачать результат
    </Button>
  );
};

export const ConvertToCsvForm = (): JSX.Element => {
  const [isCalculating] = useUnit([$isCalculating]);

  useEffect(() => {
    mounted();
  }, []);

  return (
    <Box
      maw={420}
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        formSubmitted();
      }}
    >
      <Stack>
        <Stack>
          <RinexFileInput />
          <NavFileInput />
        </Stack>
        <NavigationSystemCheckboxGroups />
        <TimeStepSelect />
        <Group>
          <Button type="submit" loading={isCalculating}>
            Рассчитать координаты
          </Button>
          <DownloadResult />
        </Group>
      </Stack>
    </Box>
  );
};
