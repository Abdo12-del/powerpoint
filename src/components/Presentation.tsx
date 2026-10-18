import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PresentationData } from '@/types/presentation';
import { usePresentation } from '@/hooks/usePresentation';
import { useKeyboardControls, type KeyboardHandlers } from '@/hooks/useKeyboardControls';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useSwipe } from '@/hooks/useSwipe';
import { screenKey } from '@/lib/navigation';
import { reportToConsole, validatePresentation } from '@/lib/validate';
import { screenVariants } from '@/components/ui';
import { ProgressBar } from '@/components/chrome/ProgressBar';
import { ControlBar } from '@/components/chrome/ControlBar';
import { KeyboardHelp } from '@/components/chrome/KeyboardHelp';
import { TitleScreen } from '@/components/screens/TitleScreen';
import { PrefaceScreen } from '@/components/screens/PrefaceScreen';
import { MapScreen } from '@/components/screens/MapScreen';
import { SlideScreen } from '@/components/screens/SlideScreen';
import { FinalScreen } from '@/components/screens/FinalScreen';

/**
 * العرض التقديمي: ينفّذ التدفق (§6)
 * العنوان ─(ابدأ)─▶ المقدمة ─(التالي)─▶ الخريطة ─(اختيار)─▶ الشرائح ─▶ الخاتمة
 */
export function Presentation({ data }: { data: PresentationData }) {
  const ctrl = usePresentation(data);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const [helpOpen, setHelpOpen] = useState(false);

  // التحقق من قائمة Definition of Done أثناء التطوير
  useEffect(() => {
    if (import.meta.env.DEV) reportToConsole(validatePresentation(data));
  }, [data]);

  const handlers = useMemo<KeyboardHandlers>(
    () => ({
      next: () => (helpOpen ? setHelpOpen(false) : ctrl.next()),
      prev: () => (helpOpen ? setHelpOpen(false) : ctrl.prev()),
      map: ctrl.openMap,
      escape: () => (helpOpen ? setHelpOpen(false) : ctrl.escape()),
      fullscreen: toggleFullscreen,
      help: () => setHelpOpen((v) => !v),
    }),
    [ctrl, helpOpen, toggleFullscreen],
  );
  useKeyboardControls(handlers);

  const swipe = useSwipe(ctrl.next, ctrl.prev);
  const onHelp = useCallback(() => setHelpOpen((v) => !v), []);

  const { screen } = ctrl;
  // آخر شريحة زارها المشاهد — تُميَّز في الخريطة كنقطة استئناف
  const lastSlideId = ctrl.visited.length > 0 ? ctrl.slides[ctrl.lastSlide]?.slide.id : undefined;

  let content: ReactNode;
  switch (screen.kind) {
    case 'title':
      content = <TitleScreen meta={data.meta} onStart={ctrl.next} />;
      break;
    case 'preface':
      content = (
        <PrefaceScreen
          steps={data.preface}
          step={screen.step}
          onGoto={(step) => ctrl.goto({ kind: 'preface', step })}
        />
      );
      break;
    case 'map':
      content = (
        <MapScreen
          chapters={data.chapters}
          slides={ctrl.slides}
          currentChapterId={ctrl.currentChapterId}
          lastSlideId={lastSlideId}
          visited={ctrl.visited}
          onSelect={ctrl.gotoSlide}
        />
      );
      break;
    case 'slide':
      content = ctrl.current ? <SlideScreen item={ctrl.current} /> : null;
      break;
    case 'final':
      content = <FinalScreen data={data.final} onMap={ctrl.openMap} onRestart={ctrl.restart} />;
      break;
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950 text-slate-100" {...swipe}>
      {/* خلفية زخرفية هادئة */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 end-[-10rem] h-[32rem] w-[32rem] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -bottom-40 start-[-10rem] h-[32rem] w-[32rem] rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04),transparent_60%)]" />
      </div>

      <ProgressBar progress={ctrl.progress} />

      <AnimatePresence mode="wait" custom={ctrl.direction} initial={false}>
        <motion.main
          key={screenKey(screen)}
          custom={ctrl.direction}
          variants={screenVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="relative z-10 h-full w-full"
        >
          {content}
        </motion.main>
      </AnimatePresence>

      <ControlBar ctrl={ctrl} isFullscreen={isFullscreen} onFullscreen={toggleFullscreen} onHelp={onHelp} />
      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
