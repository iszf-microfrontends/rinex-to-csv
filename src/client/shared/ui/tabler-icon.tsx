import { rem } from '@mantine/core';
import { IconUpload, TablerIconsProps as LibTablerIconsProps } from '@tabler/icons-react';

type IconType = 'upload';

type TablerIconProps = Omit<LibTablerIconsProps, 'size'> & {
  type: IconType;
};

const icons: { [key in IconType]: (props: LibTablerIconsProps) => JSX.Element } = {
  upload: IconUpload,
};

export const TablerIcon = ({ type, ...other }: TablerIconProps) => {
  const IconComponent = icons[type];
  return <IconComponent size={rem(18)} stroke={2} {...other} />;
};
