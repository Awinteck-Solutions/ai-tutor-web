import { SegmentedControl } from '@mantine/core';

const ViewToggle = ({ value, onChange, className = '' }) => (
  <SegmentedControl
    value={value}
    onChange={onChange}
    className={className}
    data={[
      { label: 'Grid', value: 'grid' },
      { label: 'List', value: 'list' },
    ]}
  />
);

export default ViewToggle;
