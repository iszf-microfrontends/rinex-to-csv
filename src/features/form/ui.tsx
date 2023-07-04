import { useEffect } from 'react';

import { useUnit } from 'effector-react';

import { Button, ButtonProps, Checkbox, createStyles, FileInput, Group, Select, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';

import { navigationMeasurements, navigationSystems, timeStepData } from './constants';
import * as model from './model';
import { NavigationMeasurement, NavigationOption, NavigationType, TimeStep } from './types';

const useStyles = createStyles(() => ({
  input: {
    width: 400,
  },
}));

export function Form(): JSX.Element | null {
  const { classes } = useStyles();

  const { mounted, timeStepChanged, navigationOptionChanged, formSubmitted, timeStep, timeStepError, navigationOptions } = useUnit({
    mounted: model.mounted,
    timeStepChanged: model.timeStepChanged,
    navigationOptionChanged: model.navigationOptionChanged,
    formSubmitted: model.formSubmitted,
    timeStep: model.$timeStep,
    timeStepError: model.$timeStepError,
    navigationOptions: model.$navigationOptions,
  });

  useEffect(() => {
    mounted();
  }, [mounted]);

  const findNavigationOptionByType = (type: NavigationType): NavigationOption | undefined =>
    navigationOptions.find((option) => option.type === type);

  const navigationSystemCheckboxGroups = navigationSystems.map((system) => (
    <Checkbox.Group
      mt="xs"
      key={system.type}
      label={system.label}
      value={findNavigationOptionByType(system.type)?.measurements}
      onChange={(value) => navigationOptionChanged({ type: system.type, measurements: value as NavigationMeasurement[] })}
    >
      <Group mt="xs">
        {navigationMeasurements.map((measurement) => (
          <Checkbox key={measurement} label={measurement} value={measurement} />
        ))}
      </Group>
    </Checkbox.Group>
  ));

  return (
    <div>
      <Title>Rinex-to-csv</Title>
      <Stack spacing="xl" mt="xl">
        <Stack>
          <FileInput
            className={classes.input}
            accept=".rnx,.rinex"
            label="Файл rinex"
            placeholder="Загрузить файл"
            icon={<IconUpload size="1rem" />}
          />
          <FileInput
            className={classes.input}
            accept=".nav,.21o"
            label="Файл nav"
            placeholder="Загрузить файл"
            icon={<IconUpload size="1.1rem" />}
          />
        </Stack>
        <div>
          <Text size="sm" fw={500}>
            Опции для расчета:
          </Text>
          {navigationSystemCheckboxGroups}
        </div>
        <Select
          required
          className={classes.input}
          label="Временной промежуток"
          placeholder="Выберите временной промежуток"
          value={String(timeStep)}
          data={timeStepData}
          error={timeStepError}
          onChange={(value) => {
            if (value) {
              timeStepChanged(Number(value) as TimeStep);
            }
          }}
        />
        <Group>
          <Button onClick={formSubmitted}>Рассчитать координаты</Button>
          <DisabledButton disabled tooltip="Сперва нужно рассчитать координаты">
            Скачать результат
          </DisabledButton>
        </Group>
      </Stack>
    </div>
  );
}

type DisabledButtonProps = ButtonProps & {
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
