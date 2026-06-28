import { Tabs } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../PageShell';

const SettingsPageShell = ({ activeTab, onTabChange, tabs, children }) => {
  const { t } = useTranslation('settings');

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <PageHeader title={t('title')} description={t('description')} />

      <Tabs
        value={activeTab}
        onChange={onTabChange}
        keepMounted={false}
        classNames={{
          root: 'min-w-0',
          list: 'flex-nowrap overflow-x-auto border-b border-border/50 pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          tab: 'shrink-0 whitespace-nowrap px-3 py-2.5 text-sm font-medium data-[active=true]:border-b-2 data-[active=true]:border-primary data-[active=true]:text-primary sm:px-4',
        }}
      >
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value} leftSection={tab.icon}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {tabs.map((tab) => (
          <Tabs.Panel key={tab.value} value={tab.value} pt="md">
            <div className="grid min-w-0 gap-4 sm:gap-6">{children(tab.value)}</div>
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
};

export default SettingsPageShell;
