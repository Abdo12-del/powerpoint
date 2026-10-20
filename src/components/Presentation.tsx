import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
import { useChalkboard } from '@/chalkboard/useChalkboard';
import { ChalkboardOverlay } from '@/chalkboard/ChalkboardOverlay';
import { useSpotlight } from '@/spotlight/useSpotlight';
import { SpotlightOverlay } from '@/spotlight/SpotlightOverlay';
import { zoomCss } from '@/spotlight/engine';
import { ZOOM_TRANSITION_S } from '@/spotlight/types';

/**
 * العرض التقديمي: ينفّذ التدفق (§6)
 * العنوان ─(ابدأ)─▶ المقدمة ─(التالي)─▶ الخريطة ─(اختيار)─▶ الشرائح ─▶ الخاتمة
 * مع السبورة والتعليق (C/B) والتكبير والتركيز (Alt+Click / Z / S / L)
 */
export function Presentation({ data }: { data: PresentationData }) {
  const ctrl = usePresentation(data);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const [helpOpen, setHelpOpen] = useState(false);
  const board = useChalkboard();
  const spot = useSpotlight();

  // التحقق من قائمة Definition of Done أثناء التطوير
  useEffect(() => {
    if (import.meta.env.DEV) reportToConsole(validatePresentation(data));
  }, [data]);

  const handlers = useMemo<KeyboardHandlers>(
    () => ({
      // في السبورة المستقلة: الأسهم تقلّب صفحات السبورة لا الشرائح
      next: () => {
        if (helpOpen) return setHelpOpen(false);
        if (board.mode === 'board') return board.nextPage();
        ctrl.next();
      },
      prev: () => {
        if (helpOpen) return setHelpOpen(false);
        if (board.mode === 'board') return board.prevPage();
        ctrl.prev();
      },
      map: () => (board.mode === 'board' ? board.close() : ctrl.openMap()),
      escape: () => {
        if (helpOpen) return setHelpOpen(false);
        // الخروج بالطبقات: السبورة ← الليزر ← تسليط الضوء ← التكبير ← السلوك الاعتيادي
        if (board.mode !== 'off') return board.close();
        if (spot.laserOn) return spot.toggleLaser();
        if (spot.spotlightOn) return spot.toggleSpotlight();
        if (spot.zoomActive) return spot.zoomOut();
        ctrl.escape();
      },
      fullscreen: toggleFullscreen,
      help: () => setHelpOpen((v) => !v),
      annotate: board.toggleNotes,
      chalkboard: board.toggleBoard,
      clearDrawing: board.clear,
      zoomToggle: spot.toggleZoomCenter,
      spotlight: spot.toggleSpotlight,
      laser: spot.toggleLaser,
    }),
    [ctrl, helpOpen, toggleFullscreen, board, spot],
  );
  useKeyboardControls(handlers);

  // Alt+Click تكبير نحو نقطة الشرح (نموذج RevealZoom: Ctrl على لينكس) — خارج أزرار الواجهة والسبورة
  const onStagePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const key = /Linux/.test(window.navigator.platform) ? 'ctrlKey' : 'altKey';
      if (!e[key]) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('button, a, input, select, textarea, [data-no-zoom]')) return;
      if (board.mode !== 'off') return; // أثناء الرسم: النقر يرسم لا يُكبّر
      e.preventDefault();
      const stage = zoomStageRef.current;
      if (!stage) return;
      spot.zoomAt(e.clientX, e.clientY, stage.getBoundingClientRect());
    },
    [board.mode, spot],
  );
  const zoomStageRef = useRef<HTMLDivElement>(null);

  // العجلة: أثناء التكبير تغيّر المستوى، وأثناء تسليط الضوء تغيّر نصف القطر
  const onStageWheel = useCallback(
    (e: React.WheelEvent) => {
      if (spot.zoomActive) spot.nudgeZoom(e.deltaY < 0 ? 0.25 : -0.25);
      else if (spot.spotlightOn) spot.nudgeSpotlightRadius(e.deltaY < 0 ? 10 : -10);
    },
    [spot],
  );


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
    <div
      className="relative h-dvh w-full overflow-hidden bg-slate-950 text-slate-100"
      {...swipe}
      onPointerDown={onStagePointerDown}
      onWheel={onStageWheel}
    >
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
          {/* مرحلة التكبير — نموذج RevealZoom: scale+translate نحو نقطة النقر */}
          <div
            ref={zoomStageRef}
            data-testid="zoom-stage"
            data-zoomed={spot.zoomActive || undefined}
            className="h-full w-full"
            style={zoomCss(spot.zoom, ZOOM_TRANSITION_S)}
          >
            {content}
          </div>
        </motion.main>
      </AnimatePresence>

      <ControlBar
        ctrl={ctrl}
        isFullscreen={isFullscreen}
        onFullscreen={toggleFullscreen}
        onHelp={onHelp}
        onChalkboard={board.toggleBoard}
        onZoom={spot.toggleZoomCenter}
        onSpotlight={spot.toggleSpotlight}
        onLaser={spot.toggleLaser}
      />
      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* السبورة والتعليق — صامتة حتى يطلبها المُقدِّم (C أو B) */}
      <ChalkboardOverlay board={board} layerId={screenKey(ctrl.screen)} layerLabel={chalkboardLayerLabel(ctrl.screen)} />

      {/* التكبير والتركيز: تسليط الضوء ومؤشر الليزر — شفافتان للنقر */}
      <SpotlightOverlay spot={spot} />
    </div>
  );
}

/** اسم عربي قصير للطبقة يظهر في شارة التعليق */
function chalkboardLayerLabel(screen: ReturnType<typeof usePresentation>['screen']): string {
  switch (screen.kind) {
    case 'slide':
      return `الشريحة ${screen.index + 1}`;
    case 'preface':
      return 'المقدمة';
    case 'map':
      return 'الخريطة';
    case 'final':
      return 'الخاتمة';
    default:
      return 'شاشة العنوان';
  }
}
