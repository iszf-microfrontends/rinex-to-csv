import { HTMLAttributes, useEffect } from 'react';

import { useUnit } from 'effector-react';

import { FileInputWithLoading } from '@iszf-microfrontends/shared-ui';
import { Button, ButtonProps, Checkbox, createStyles, Group, Select, Stack, Text, Tooltip } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';

import { fileAccept, navigationMeasurements, navigationSystems, timeStepData } from './config';
import * as model from './model';
import { NavigationMeasurement, NavigationOption, NavigationType, TimeStep } from './types';

const useStyles = createStyles(() => ({
  input: {
    width: 400,
  },
}));

export function MainComponent(): JSX.Element | null {
  const { classes } = useStyles();

  const stores = useUnit({
    rinexFile: model.$rinexFile,
    rinexFileError: model.$rinexFileError,
    isRinexFileLoading: model.$isRinexFileLoading,
    navFile: model.$navFile,
    navFileError: model.$navFileError,
    isNavFileLoading: model.$isNavFileLoading,
    navigationOptions: model.$navigationOptions,
    navigationOptionsError: model.$navigationOptionsError,
    timeStep: model.$timeStep,
    timeStepError: model.$timeStepError,
    isCalculating: model.$isCalculating,
    isDownloadResultDisabled: model.$isDownloadResultDisabled,
    isResultDownloading: model.$isResultDownloading,
  });
  const events = useUnit({
    mounted: model.mounted,
    uploadRinexFile: model.uploadRinexFile,
    uploadNavFile: model.uploadNavFile,
    navigationOptionChanged: model.navigationOptionChanged,
    timeStepChanged: model.timeStepChanged,
    downloadResultPressed: model.downloadResultPressed,
    formSubmitted: model.formSubmitted,
  });

  useEffect(() => {
    events.mounted();
  }, [events]);

  const handleFileChange = (type: 'rinex' | 'nav') => (file: File | null) => {
    if (file) {
      switch (type) {
        case 'rinex':
          events.uploadRinexFile(file);
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
          <FileInputWithLoading
            required
            className={classes.input}
            accept={fileAccept}
            label="Файл rinex"
            placeholder="Загрузить файл"
            icon={<IconUpload size="1rem" />}
            value={stores.rinexFile}
            error={stores.rinexFileError}
            loading={stores.isRinexFileLoading}
            onChange={handleFileChange('rinex')}
          />
          <FileInputWithLoading
            required
            className={classes.input}
            accept={fileAccept}
            label="Файл nav"
            placeholder="Загрузить файл"
            icon={<IconUpload size="1.1rem" />}
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
          value={String(stores.timeStep)}
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
          <DisabledButton
            tooltip="Сперва нужно рассчитать координаты"
            disabled={stores.isDownloadResultDisabled}
            loading={stores.isResultDownloading}
            onClick={events.downloadResultPressed}
          >
            Скачать результат
          </DisabledButton>
        </Group>
      </Stack>
    </form>
  );
}

type DisabledButtonProps = ButtonProps &
  HTMLAttributes<HTMLButtonElement> & {
    tooltip: string;
  };

function DisabledButton({ disabled, tooltip, ...other }: DisabledButtonProps): JSX.Element | null {
  return disabled ? (
    <Tooltip label={tooltip}>
      <span>
        <Button disabled={disabled} {...other} />
      </span>
    </Tooltip>
  ) : (
    <Button {...other} />
  );
}
