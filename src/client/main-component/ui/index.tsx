import { useEffect } from 'react';

import { useUnit } from 'effector-react';

import { Checkbox, Group, Select, Stack, Text } from '@mantine/core';

import { FileInput } from '@iszf-microfrontends/shared-ui';

import { NavigationMeasurement, NavigationOption, NavigationType, TimeStep } from '@client/shared/api';
import { Button, TablerIcon } from '@client/shared/ui';

import { useStyles } from './styles';

import { fileAccept, navigationMeasurements, navigationSystems, timeStepData } from '../config';
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
  navigationOptionChanged,
  rinexFileChanged,
  timeStepChanged,
  uploadNavFile,
} from '../model';

export const MainComponent = () => {
  const { classes } = useStyles();

  const stores = useUnit({
    rinexFile: $rinexFile,
    rinexFileError: $rinexFileError,
    isRinexFileLoading: $isRinexFileLoading,
    navFile: $navFile,
    navFileError: $navFileError,
    isNavFileLoading: $isNavFileLoading,
    navigationOptions: $navigationOptions,
    navigationOptionsError: $navigationOptionsError,
    timeStep: $timeStep,
    timeStepError: $timeStepError,
    isCalculating: $isCalculating,
    isDownloadResultDisabled: $isDownloadResultDisabled,
    isResultDownloading: $isResultDownloading,
  });

  const events = useUnit({
    mounted: mounted,
    rinexFileChanged: rinexFileChanged,
    uploadNavFile: uploadNavFile,
    navigationOptionChanged: navigationOptionChanged,
    timeStepChanged: timeStepChanged,
    downloadResultPressed: downloadResultPressed,
    formSubmitted: formSubmitted,
  });

  useEffect(() => {
    events.mounted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (type: 'rinex' | 'nav') => (file: File | null) => {
    if (file) {
      switch (type) {
        case 'rinex':
          events.rinexFileChanged(file);
          break;
        case 'nav':
          events.uploadNavFile(file);
          break;
      }
    }
  };

  const findNavigationOptionByType = (type: NavigationType): NavigationOption | undefined =>
    stores.navigationOptions.find((option) => option.type === type);

  const navigationSystemCheckboxGroups = navigationSystems.map((system) => (
    <Checkbox.Group
      mt="xs"
      key={system.type}
      label={system.label}
      value={findNavigationOptionByType(system.type)?.measurements}
      onChange={(value) => events.navigationOptionChanged({ type: system.type, measurements: value as NavigationMeasurement[] })}
    >
      <Group mt="xs">
        {navigationMeasurements.map((measurement) => (
          <Checkbox key={measurement} label={measurement} value={measurement} />
        ))}
      </Group>
    </Checkbox.Group>
  ));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        events.formSubmitted();
      }}
    >
      <Stack spacing="xl">
        <Stack>
          <FileInput
            required
            classNames={{
              input: classes.input,
            }}
            accept={fileAccept}
            label="Файл rinex"
            placeholder="Загрузить файл"
            icon={<TablerIcon type="upload" />}
            value={stores.rinexFile}
            error={stores.rinexFileError}
            loading={stores.isRinexFileLoading}
            onChange={handleFileChange('rinex')}
          />
          <FileInput
            required
            classNames={{
              input: classes.input,
            }}
            accept={fileAccept}
            label="Файл nav"
            placeholder="Загрузить файл"
            icon={<TablerIcon type="upload" />}
            value={stores.navFile}
            error={stores.navFileError}
            loading={stores.isNavFileLoading}
            onChange={handleFileChange('nav')}
          />
        </Stack>
        <div>
          <Text size="sm" fw={500}>
            Опции для расчета: <span style={{ color: 'red' }}>*</span>
          </Text>
          {navigationSystemCheckboxGroups}
          {stores.navigationOptionsError && (
            <Text size="xs" c="red" mt="xs">
              {stores.navigationOptionsError}
            </Text>
          )}
        </div>
        <Select
          required
          className={classes.input}
          label="Временной промежуток"
          placeholder="Выберите временной промежуток"
          value={`${stores.timeStep}`}
          data={timeStepData}
          error={stores.timeStepError}
          onChange={(value) => {
            if (value) {
              events.timeStepChanged(Number(value) as TimeStep);
            }
          }}
        />
        <Group>
          <Button type="submit" loading={stores.isCalculating}>
            Рассчитать координаты
          </Button>
          <Button
            tooltip="Сперва нужно рассчитать координаты"
            disabled={stores.isDownloadResultDisabled}
            loading={stores.isResultDownloading}
            onClick={events.downloadResultPressed}
          >
            Скачать результат
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
