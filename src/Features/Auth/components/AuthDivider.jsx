import { Divider } from '@mantine/core';

const AuthDivider = ({ label = 'or' }) => (
  <Divider
    label={label}
    labelPosition="center"
    classNames={{
      label: 'text-xs uppercase tracking-wide text-muted-foreground',
    }}
  />
);

export default AuthDivider;
