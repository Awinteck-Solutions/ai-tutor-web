import { Select, SegmentedControl } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '../GlassCard';
import { SUPPORTED_LOCALES, setAppLocale } from '../../../i18n';
import { useTheme } from '../../context/ThemeContext';

const AppearanceSettingsSection = () => {
  const { t, i18n } = useTranslation(['settings', 'common']);
  const { preference, setTheme } = useTheme();

  return (
    <GlassCard className="space-y-5 p-4 sm:p-6 lg:col-span-2">
      <div>
        <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">
          {t('settings:appearance.title')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{t('settings:appearance.hint')}</p>
      </div>

      <Select
        label={t('settings:appearance.uiLanguage')}
        data={SUPPORTED_LOCALES.map((locale) => ({
          value: locale.code,
          label: locale.label,
        }))}
        value={i18n.language?.slice(0, 2) ?? 'en'}
        onChange={(value) => value && setAppLocale(value)}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{t('settings:appearance.theme')}</p>
        <SegmentedControl
          fullWidth
          value={preference}
          onChange={setTheme}
          data={[
            { value: 'light', label: t('common:themeLight') },
            { value: 'dark', label: t('common:themeDark') },
            { value: 'edu', label: t('common:themeEdu') },
            { value: 'auto', label: t('common:themeAuto') },
          ]}
          classNames={{ root: 'flex-wrap sm:flex-nowrap', label: 'text-xs sm:text-sm' }}
        />
      </div>
    </GlassCard>
  );
};

export default AppearanceSettingsSection;
