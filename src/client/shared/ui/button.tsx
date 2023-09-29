import { HTMLAttributes } from 'react';

import { Button as MantineButton, ButtonProps as MantineButtonProps, Tooltip } from '@mantine/core';

type ButtonProps = MantineButtonProps &
  HTMLAttributes<HTMLButtonElement> & {
    tooltip?: string;
  };

export const Button = ({ disabled, tooltip, ...other }: ButtonProps) => {
  if (disabled) {
    return (
      <Tooltip label={tooltip}>
        <span>
          <MantineButton disabled={disabled} {...other} />
        </span>
      </Tooltip>
    );
  }
  return <MantineButton {...other} />;
};
