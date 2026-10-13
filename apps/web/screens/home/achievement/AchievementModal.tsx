import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AppText, Button, Graphic } from '../../../src/components';
import { AchievementBadge } from '../../../src/features/home';
import { useI18n } from '../../../src/i18n';
import { pointsOf } from '../../../src/lib/streak';
import { useTheme } from '../../../src/theme';
import { ART, lockSvg, pillSvg } from './art';

/** The sheet's measures in the design: 378 px tall on a 390 px screen, the handle 5 px from its top. */
const SHEET_RADIUS = 26;
const HANDLE = { width: 54, height: 3, top: 5 };
const ART_TOP = 25;
const BUTTON = { maxWidth: 271, height: 57 };
const SHEET_MAX = 480;
/** The design's picture sits 13 px left of the sheet's middle (it starts at x = 83, not 96): twice that as a margin. */
const ART_SHIFT = 26;
/** Its "Yay!" is centred 2.5 px left of the pill's middle. */
const LABEL_SHIFT = 5;
/** The keyboard focus ring: a white line inside the pill's edge. */
const FOCUS_RING = { inset: 3, width: 2 };

/**
 * The celebration the design draws as "2.2 Main": a bottom sheet over the home screen with the unlocked badge, the
 * days reached, the points and one "Yay!" button. The button, Esc and a tap on the veil all call `onClose`.
 * The sheet is a `Modal` (on the web a dialog that keeps the focus inside); Esc is listened for here too, because the
 * `Modal`'s own listener only runs once it has marked itself active.
 */
export function AchievementModal({ days, onClose }: { days: number; onClose: () => void }) {
  const { theme } = useTheme();
  const { t, tn, format } = useI18n();
  const { width } = useWindowDimensions();
  const wide = width >= theme.breakpoint;
  const dismiss = useRef<View>(null);
  // The ring around the pill shows once the keyboard is in use (Tab), not on the focus the sheet gives on opening.
  const [keyboard, setKeyboard] = useState(false);

  useEffect(() => {
    // The portal mounts the sheet after this effect's first run: focus the button once it is there.
    const frame = requestAnimationFrame(() => {
      const button = dismiss.current;
      if (!button) return;
      // The browser's own ring is replaced by the one drawn below, so it can follow the design's pill.
      if (button instanceof HTMLElement) button.style.outline = 'none';
      button.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // A layout effect: the listener is on before the sheet is first painted, so an Esc pressed at once is not lost.
  useLayoutEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'Tab') {
        // The button is the sheet's only control: Tab keeps the focus on it instead of leaving the dialog.
        event.preventDefault();
        dismiss.current?.focus();
        setKeyboard(true);
      } else setKeyboard(true);
    };
    const onPointer = () => setKeyboard(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [onClose]);

  const title = t('home.unlocked.title');
  const reached = t('home.unlocked.days', { days: format.number(days) });
  const { badge, lock } = ART;
  return (
    <Modal transparent animationType="none" visible onRequestClose={onClose}>
      <View testID="home-achievement-modal" style={styles.root}>
        <Pressable
          testID="home-achievement-backdrop" accessible={false} onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.scrim }]}
        />
        <View pointerEvents="box-none" style={styles.bottom}>
          <View
            testID="home-achievement-sheet" aria-label={`${title} ${reached}`}
            style={{
              width: '100%', maxWidth: wide ? SHEET_MAX : undefined, backgroundColor: theme.colors.surface,
              borderTopLeftRadius: SHEET_RADIUS, borderTopRightRadius: SHEET_RADIUS,
              borderBottomLeftRadius: wide ? SHEET_RADIUS : 0, borderBottomRightRadius: wide ? SHEET_RADIUS : 0,
              marginBottom: wide ? theme.spacing.lg : 0, ...theme.shadow.md, alignItems: 'center',
              paddingTop: ART_TOP, paddingBottom: theme.spacing.xxl - 2, paddingHorizontal: theme.spacing.xl,
            }}
          >
            <View
              style={{
                position: 'absolute', top: HANDLE.top, width: HANDLE.width, height: HANDLE.height,
                borderRadius: theme.radius.pill, backgroundColor: theme.colors.handle,
              }}
            />
            <View accessible={false} style={{ width: ART.width, height: ART.height, marginRight: ART_SHIFT }}>
              {ART.bubbles.map((bubble) => (
                <View
                  key={`${bubble.left}-${bubble.top}`}
                  style={{
                    position: 'absolute', left: bubble.left, top: bubble.top, width: bubble.size, height: bubble.size,
                    borderRadius: theme.radius.pill,
                    backgroundColor: bubble.strong ? theme.colors.glowStrong : theme.colors.glow,
                    opacity: bubble.faint ? 0.37 : 1,
                  }}
                />
              ))}
              <View
                style={{
                  position: 'absolute', left: badge.left, top: badge.top, width: badge.box, height: badge.box,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <View style={{ transform: [{ scale: badge.scale }] }}><AchievementBadge /></View>
              </View>
              <View
                style={{
                  position: 'absolute', left: lock.left, top: lock.top, width: lock.size, height: lock.size,
                  borderRadius: theme.radius.pill, backgroundColor: theme.colors.lock, borderWidth: lock.border,
                  borderColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Graphic svg={lockSvg} width={lock.glyph} height={lock.glyph} />
              </View>
            </View>
            <View style={{ marginTop: theme.spacing.md - 2, alignItems: 'center' }}>
              <AppText testID="home-achievement-modal-title" style={{ textAlign: 'center' }}>{title}</AppText>
              <AppText testID="home-achievement-modal-days" style={{ textAlign: 'center' }}>{reached}</AppText>
            </View>
            <AppText
              variant="caption" testID="home-achievement-modal-points"
              style={{ marginTop: theme.spacing.sm + 2, textAlign: 'center' }}
            >
              {tn('home.points', pointsOf(days))}
            </AppText>
            <View
              style={{
                marginTop: theme.spacing.md + 1, width: '100%', maxWidth: BUTTON.maxWidth, height: BUTTON.height,
                borderRadius: theme.radius.xl, overflow: 'hidden',
              }}
            >
              <Graphic
                svg={pillSvg(theme.colors.pillFrom, theme.colors.pillTo)} width={BUTTON.maxWidth} height={BUTTON.height}
                style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
              />
              <Button
                ref={dismiss} testID="home-achievement-dismiss" title={t('home.unlocked.dismiss')} onPress={onClose}
                style={{ backgroundColor: 'transparent', paddingTop: 2, paddingRight: theme.spacing.xl + LABEL_SHIFT }}
              />
              {keyboard ? (
                <View
                  testID="home-achievement-focus-ring" pointerEvents="none"
                  style={{
                    position: 'absolute', top: FOCUS_RING.inset, bottom: FOCUS_RING.inset, left: FOCUS_RING.inset,
                    right: FOCUS_RING.inset, borderRadius: theme.radius.xl, borderWidth: FOCUS_RING.width,
                    borderColor: theme.colors.onPrimary,
                  }}
                />
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bottom: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
});
