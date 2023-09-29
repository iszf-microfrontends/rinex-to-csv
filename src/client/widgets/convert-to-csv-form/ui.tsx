import { useEffect } from 'react';

import { FileInput } from '@iszf-microfrontends/shared-ui';
import { Box, Checkbox, Group, Select, Stack, Text } from '@mantine/core';
import { useUnit } from 'effector-react';

import { NavigationMeasurement, NavigationOption, NavigationType, TimeStep } from '~client/shared/api';
import { Button, TablerIcon } from '~client/shared/ui';

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

const RinexFileInput = () => {
  const [rinexFile, rinexFileError, isRinexFileLoading] = useUnit([$rinexFile, $rinexFileError, $isRinexFileLoading]);

  return (
    <FileInput
      required
      accept={fileAccept}
      label="Файл rinex"
      placeholder="Загрузить файл"
      icon={<TablerIcon type="upload" />}
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

const NavFileInput = () => {
  const [navFile, navFileError, isNavFileLoading] = useUnit([$navFile, $navFileError, $isNavFileLoading]);

  return (
    <FileInput
      required
      accept={fileAccept}
      label="Файл nav"
      placeholder="Загрузить файл"
      icon={<TablerIcon type="upload" />}
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

const NavigationSystemCheckboxGroups = () => {
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

const TimeStepSelect = () => {
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

const DownloadResult = () => {
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

export const ConvertToCsvForm = () => {
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
