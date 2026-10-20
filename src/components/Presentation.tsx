import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import type { PresentationData } from '@/types/presentation';
import { usePresentation } from '@/hooks/usePresentation';
import { useKeyboardControls, type KeyboardHandlers } from '@/hooks/useKeyboardControls';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useSwipe } from '@/hooks/useSwipe';
import { nextScreen, screenKey } from '@/lib/navigation';
import type { Screen } from '@/lib/navigation';
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
import { PresenterWindow } from '@/presenter/PresenterWindow';
import { notesFor, screenInfo } from '@/presenter/notes';
import { PRESENTER_WINDOW_FEATURES, PRESENTER_WINDOW_NAME } from '@/presenter/types';

/**
 * العرض التقديمي: ينفّذ التدفق (§6)
 * العنوان ─(ابدأ)─▶ المقدمة ─(التالي)─▶ الخريطة ─(اختيار)─▶ الشرائح ─▶ الخاتمة
 * مع السبورة والتعليق (C/B) والتكبير والتركيز (Alt+Click / Z / S / L)
 * ونافذة المعلم: الملاحظات والمعاينة والمؤقت (N)
 */
export function Presentation({ data }: { data: PresentationData }) {
  const ctrl = usePresentation(data);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const [helpOpen, setHelpOpen] = useState(false);
  const board = useChalkboard();
  const spot = useSpotlight();

  // ─── نافذة المعلم: نموذج Reveal Notes — نافذة منفصلة بمعاينتين وملاحظات ومؤقت ───
  const [presenterMode, setPresenterMode] = useState<'closed' | 'popup' | 'embedded'>('closed');
  const popupWinRef = useRef<Window | null>(null);
  const popupRootRef = useRef<Root | null>(null);

  // التحقق من قائمة Definition of Done أثناء التطوير
  useEffect(() => {
    if (import.meta.env.DEV) reportToConsole(validatePresentation(data));
  }, [data]);

  const openPresenter = useCallback(() => {
    // N تبديل: مغلق ← نافذة، نافذة ← تركيز عليها، مدمجة ← إغلاق
    if (presenterMode === 'popup') {
      popupWinRef.current?.focus();
      return;
    }
    if (presenterMode === 'embedded') {
      setPresenterMode('closed');
      return;
    }
    const win = window.open('', PRESENTER_WINDOW_NAME, PRESENTER_WINDOW_FEATURES);
    if (!win) {
      // النوافذ المنبثقة محجوبة → لوحة مدمجة (نفس المكوّن)
      setPresenterMode('embedded');
      return;
    }
    // تجهيز مستند نافذة المعلم: الاتجاه واللغة + استنساخ الأنماط من الصفحة الرئيسية
    const doc = win.document;
    doc.title = 'نافذة المعلم — عرض تقديمي';
    doc.documentElement.lang = 'ar';
    doc.documentElement.dir = 'rtl';
    doc.body.style.margin = '0';
    doc.body.style.background = '#020617';
    for (const el of Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))) {
      doc.head.appendChild(el.cloneNode(true));
    }
    const container = doc.createElement('div');
    container.style.height = '100vh';
    doc.body.appendChild(container);
    popupRootRef.current = createRoot(container);
    popupWinRef.current = win;
    setPresenterMode('popup');
  }, [presenterMode]);

  const closePresenter = useCallback(() => {
    popupRootRef.current?.unmount();
    popupRootRef.current = null;
    popupWinRef.current?.close();
    popupWinRef.current = null;
    setPresenterMode('closed');
  }, []);

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
        // الخروج بالطبقات: نافذة المعلم ← السبورة ← الليزر ← التسليط ← التكبير ← الاعتيادي
        if (presenterMode !== 'closed') return closePresenter();
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
      presenter: openPresenter,
    }),
    [ctrl, helpOpen, toggleFullscreen, board, spot, presenterMode, openPresenter, closePresenter],
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

  /** مُصيّر أي شاشة — يُستعمل للمحتوى الحي ولمعاينتي نافذة المعلم */
  const renderScreen = useCallback(
    (s: Screen): ReactNode => {
      switch (s.kind) {
        case 'title':
          return <TitleScreen meta={data.meta} onStart={ctrl.next} />;
        case 'preface':
          return <PrefaceScreen steps={data.preface} step={s.step} onGoto={(step) => ctrl.goto({ kind: 'preface', step })} />;
        case 'map':
          return (
            <MapScreen
              chapters={data.chapters}
              slides={ctrl.slides}
              currentChapterId={ctrl.currentChapterId}
              lastSlideId={lastSlideId}
              visited={ctrl.visited}
              onSelect={ctrl.gotoSlide}
            />
          );
        case 'slide':
          return ctrl.slides[s.index] ? <SlideScreen item={ctrl.slides[s.index]} /> : null;
        case 'final':
          return <FinalScreen data={data.final} onMap={ctrl.openMap} onRestart={ctrl.restart} />;
      }
    },
    [data, ctrl, lastSlideId],
  );

  // تحديث نافذة المعلم بعد كل رسم — الشاشة والملاحظات والمعاينات تبقى متزامنة
  useEffect(() => {
    const root = popupRootRef.current;
    if (presenterMode !== 'popup' || !root) return;
    const nCtx = { prefaceCount: data.preface.length, slideCount: ctrl.slides.length, lastSlide: ctrl.lastSlide };
    const nxt = nextScreen(screen, nCtx);
    root.render(
      <PresenterWindow
        data={data}
        screen={screen}
        next={nxt}
        slides={ctrl.slides}
        currentInfo={screenInfo(screen, data, ctrl.slides)}
        nextInfo={screenInfo(nxt, data, ctrl.slides)}
        notes={notesFor(screen, data, ctrl.slides)}
        progress={ctrl.progress}
        renderScreen={renderScreen}
        onNext={ctrl.next}
        onPrev={ctrl.prev}
        variant="popup"
        onClose={closePresenter}
        popupWindow={popupWinRef.current}
      />,
    );
  });

  // تنظيف: إن أُغلقت النافذة يدوياً أو غادرت الصفحة — وإنزال الجذر عند الإلغاء
  useEffect(() => {
    const check = () => {
      if (presenterMode === 'popup' && popupWinRef.current?.closed) closePresenter();
    };
    const id = setInterval(check, 1000);
    window.addEventListener('pagehide', closePresenter);
    return () => {
      clearInterval(id);
      window.removeEventListener('pagehide', closePresenter);
    };
  }, [presenterMode, closePresenter]);
  useEffect(
    () => () => {
      popupRootRef.current?.unmount();
      popupRootRef.current = null;
      popupWinRef.current?.close();
      popupWinRef.current = null;
    },
    [],
  );

  // الشاشة التالية للمعاينة (نفس عقد التدفق §6)
  const navCtx = { prefaceCount: data.preface.length, slideCount: ctrl.slides.length, lastSlide: ctrl.lastSlide };
  const nextScreenNode = nextScreen(screen, navCtx);

  let content: ReactNode = renderScreen(screen);

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
        onPresenter={openPresenter}
      />
      <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* السبورة والتعليق — صامتة حتى يطلبها المُقدِّم (C أو B) */}
      <ChalkboardOverlay board={board} layerId={screenKey(ctrl.screen)} layerLabel={chalkboardLayerLabel(ctrl.screen)} />

      {/* التكبير والتركيز: تسليط الضوء ومؤشر الليزر — شفافتان للنقر */}
      <SpotlightOverlay spot={spot} />

      {/* نافذة المعلم المدمجة — تظهر فقط عند حجب النوافذ المنبثقة (بديل النافذة المنفصلة) */}
      {presenterMode === 'embedded' && (
        <div data-testid="presenter-embedded" className="fixed inset-0 z-[80] bg-slate-950/95 p-3 backdrop-blur-sm sm:p-5">
          <div className="mx-auto h-full max-w-6xl overflow-hidden rounded-2xl border border-white/10">
            <PresenterWindow
              data={data}
              screen={screen}
              next={nextScreenNode}
              slides={ctrl.slides}
              currentInfo={screenInfo(screen, data, ctrl.slides)}
              nextInfo={screenInfo(nextScreenNode, data, ctrl.slides)}
              notes={notesFor(screen, data, ctrl.slides)}
              progress={ctrl.progress}
              renderScreen={renderScreen}
              onNext={ctrl.next}
              onPrev={ctrl.prev}
              variant="embedded"
              onClose={closePresenter}
            />
          </div>
        </div>
      )}
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
