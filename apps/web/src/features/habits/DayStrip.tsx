import React, { useMemo } from 'react';
import { View } from 'react-native';
import { AppText } from '../../components';
import { useI18n } from '../../i18n';
import { useTheme } from '../../theme';

const BEHIND = 3;
const AHEAD = 6;
const CHIP = 30;
const TODAY_HEIGHT = 49;

/**
 * The day strip of the design: three days behind us, today as a violet pill with its weekday, and six days
 * ahead — as round chips. It only shows the calendar for now; marking a day comes with the check feature.
 */
export function DayStrip() {
  const { theme } = useTheme();
  const { t, format } = useI18n();
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: BEHIND + 1 + AHEAD }, (_, i) => {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i - BEHIND);
      return { date, offset: i - BEHIND };
    });
  }, []);
  return (
    <View
      testID="home-days" accessibilityLabel={t('habits.days.label')}
      style={{ width: '100%', maxWidth: 354, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}
    >
      {days.map(({ date, offset }) => {
        const today = offset === 0;
        const fill = today ? theme.colors.primary : offset < 0 ? theme.colors.dayPast : theme.colors.dayFuture;
        return (
          <View
            key={offset} testID={today ? 'home-day-today' : 'home-day'} accessible
            accessibilityLabel={format.date(date, { dateStyle: 'full' })}
            style={{
              width: CHIP, height: today ? TODAY_HEIGHT : CHIP, borderRadius: theme.radius.pill, backgroundColor: fill,
              alignItems: 'center', paddingTop: theme.spacing.tight - theme.spacing.xxs, gap: theme.spacing.xxs,
            }}
          >
            <AppText variant="chip" style={{ color: theme.colors.onPrimary, textAlign: 'center' }}>
              {format.number(date.getDate())}
            </AppText>
            {today ? (
              <AppText variant="micro" style={{ color: theme.colors.onPrimary, textAlign: 'center' }}>
                {format.date(date, { weekday: 'short' })}
              </AppText>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
