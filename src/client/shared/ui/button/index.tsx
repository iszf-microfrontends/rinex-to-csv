import { HTMLAttributes } from 'react';

import { Button as MantineButton, ButtonProps as MantineButtonProps, Tooltip } from '@mantine/core';

type ButtonProps = MantineButtonProps &
  HTMLAttributes<HTMLButtonElement> & {
    tooltip?: string;
  };

export const Button = ({ disabled, tooltip, ...other }: ButtonProps) => {
  return disabled ? (
    <Tooltip label={tooltip}>
      <span>
        <MantineButton disabled={disabled} {...other} />
      </span>
    </Tooltip>
  ) : (
    <MantineButton {...other} />
  );
};
