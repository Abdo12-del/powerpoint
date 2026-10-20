// @vitest-environment jsdom
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildSequence, flattenSlides } from '@/lib/navigation';
import type { PresentationData } from '@/types/presentation';
import { Info, Layers } from 'lucide-react';
import { TitleScreen } from '@/components/screens/TitleScreen';
import { SlideScreen } from '@/components/screens/SlideScreen';
import { PresenterWindow } from '@/presenter/PresenterWindow';
import { notesFor, screenInfo } from '@/presenter/notes';
import { PresenterLab } from '@/presenter/lab/PresenterLab';
import { presentation } from '@/data/presentation';
import { Presentation } from '@/components/Presentation';
import { SHORTCUTS, KEYS } from '@/config/controls';

// jsdom بلا OffscreenCanvas — تعطيل جزيئات الخلفية (نمط اختبارات chalkboard/spotlight)
vi.mock('@tsparticles/react', () => ({ default: () => null, ParticlesProvider: () => null }));

// React 19: فعّل بيئة act صراحةً في jsdom
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** بيانات بملاحظات + شريحتان */
const DATA: PresentationData = {
  meta: {
    organization: ['الجامعة'],
    workType: 'مذكرة',
    title: 'عرض نافذة المعلم',
    authors: [],
    date: '2026',
    notes: 'رحّب بالحضور واذكر الخطة الزمنية.',
  },
  preface: [],
  chapters: [
    {
      id: 'ch1',
      title: 'الفصل الأول',
      icon: Layers,
      color: 'from-sky-600/20 to-sky-400/10',
      accent: 'text-sky-200 border-sky-400/40',
      slides: [
        { id: 'ch1-a', chapterId: 'ch1', title: 'المحور أ', subtitle: 'الشرح', icon: Info, archetype: 'bullets', content: <p>محتوى أ</p>, notes: 'ملاحظة الشريحة أ: أشر إلى الرسم.' },
        { id: 'ch1-b', chapterId: 'ch1', title: 'المحور ب', icon: Info, archetype: 'stats', content: <p>محتوى ب</p> },
      ],
    },
  ],
  final: { title: 'الخاتمة', summary: ['خلاصة'], closing: 'إغلاق', thanks: 'شكراً' },
};

const slides = flattenSlides(DATA.chapters);
const noop = () => undefined;

const renderScreen = (s: ReturnType<typeof buildSequence>[number]): ReactNode => {
  switch (s.kind) {
    case 'title':
      return <TitleScreen meta={DATA.meta} onStart={noop} />;
    case 'slide':
      return slides[s.index] ? <SlideScreen item={slides[s.index]} /> : null;
    default:
      return <div>شاشة</div>;
  }
};

function propsFor(screen: ReturnType<typeof buildSequence>[number], next: ReturnType<typeof buildSequence>[number]) {
  return {
    data: DATA,
    screen,
    next,
    slides,
    currentInfo: screenInfo(screen, DATA, slides),
    nextInfo: screenInfo(next, DATA, slides),
    notes: notesFor(screen, DATA, slides),
    progress: 0.5,
    renderScreen,
    onNext: noop,
    onPrev: noop,
    variant: 'embedded' as const,
  };
}

describe('نافذة المعلم — PresenterWindow', () => {
  it('تعرض معاينتين حقيقيتين (حالي بتلاحظه + تالٍ)، العدّاد، المؤقت، وشارة الخصوصية', () => {
    const html = renderToStaticMarkup(
      <PresenterWindow {...propsFor({ kind: 'slide', index: 0 }, { kind: 'slide', index: 1 })} />,
    );
    expect(html).toContain('نافذة المعلم');
    expect(html).toContain('الملاحظات مخفية عن الطلاب');
    expect(html).toContain('ملاحظة الشريحة أ: أشر إلى الرسم.');
    expect(html).toContain('data-testid="presenter-preview-current"');
    expect(html).toContain('data-testid="presenter-preview-next"');
    expect(html).toContain('المحور أ'); // معاينة حقيقية للشريحة
    expect(html).toContain('المحور ب'); // معاينة التالية
    expect(html).toContain('الشريحة 1 / 2');
    expect(html).toContain('data-testid="presenter-elapsed"');
    expect(html).toContain('00:00');
  });

  it('الملاحظات الفارغة تظهر التلميحة (القالب الأبيض) بلا نص للطلاب', () => {
    const html = renderToStaticMarkup(
      <PresenterWindow {...propsFor({ kind: 'slide', index: 1 }, { kind: 'final' })} />,
    );
    expect(html).toContain('بلا ملاحظات لهذه الشاشة');
    expect(html).not.toContain('ملاحظة الشريحة أ');
  });

  it('أزرار التنقّل تستدعي onNext/onPrev والإغلاق يستدعي onClose', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const onClose = vi.fn();
    await act(async () => {
      root.render(
        <PresenterWindow
          {...propsFor({ kind: 'title' }, { kind: 'preface', step: 0 })}
          onNext={onNext}
          onPrev={onPrev}
          onClose={onClose}
        />,
      );
    });
    await act(async () => {
      (container.querySelector('[data-testid="presenter-next"]') as HTMLButtonElement).click();
      (container.querySelector('[data-testid="presenter-prev"]') as HTMLButtonElement).click();
      (container.querySelector('[data-testid="presenter-close"]') as HTMLButtonElement).click();
    });
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    await act(async () => root.unmount());
    container.remove();
  });

  it('المؤقت يعمل ثم يتوقف مؤقتاً ثم يُصفَّر (تحديث نصف ثانية)', async () => {
    vi.useFakeTimers();
    try {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);
      await act(async () => {
        root.render(<PresenterWindow {...propsFor({ kind: 'title' }, { kind: 'preface', step: 0 })} />);
      });
      const elapsed = () => container.querySelector('[data-testid="presenter-elapsed"]')?.textContent;
      expect(elapsed()).toBe('00:00');

      await act(async () => {
        vi.advanceTimersByTime(2100);
      });
      expect(elapsed()).toBe('00:02');

      await act(async () => {
        (container.querySelector('[data-testid="presenter-timer-toggle"]') as HTMLButtonElement).click();
      });
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });
      expect(elapsed()).toBe('00:02'); // مجمّد أثناء الإيقاف

      await act(async () => {
        (container.querySelector('[data-testid="presenter-timer-reset"]') as HTMLButtonElement).click();
      });
      expect(elapsed()).toBe('00:00');

      await act(async () => root.unmount());
      container.remove();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('التكامل مع العرض المباشر — Presentation', () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    // jsdom: window.open غير منفذة → البديل المدمج (نفس مسار حجب النوافذ في المتصفح)
    vi.spyOn(window, 'open').mockReturnValue(null);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.restoreAllMocks();
  });

  it('مغلق افتراضياً: لا ملاحظات ولا نافذة — الملاحظات مخفية عن الطلاب', async () => {
    await act(async () => {
      root.render(<Presentation data={presentation} />);
    });
    expect(container.querySelector('[data-testid="presenter-window"]')).toBeNull();
    expect(container.querySelector('[data-testid="presenter-embedded"]')).toBeNull();
    expect(container.querySelector('[aria-label^="نافذة المعلم"]')).toBeTruthy(); // زر أيقونة فقط
    expect(container.textContent).not.toContain('ملاحظات المُقدِّم');
  });

  it('N يفتح اللوحة المدمجة (بديل النافذة المنبثقة المحجوبة) وN/Esc يغلقها', async () => {
    await act(async () => {
      root.render(<Presentation data={presentation} />);
    });
    const press = (key: string) =>
      act(async () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      });

    await press('n');
    expect(container.querySelector('[data-testid="presenter-embedded"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="presenter-window"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="presenter-notes"]')).toBeTruthy();

    await press('n');
    expect(container.querySelector('[data-testid="presenter-embedded"]')).toBeNull();

    await press('n');
    await press('Escape');
    expect(container.querySelector('[data-testid="presenter-embedded"]')).toBeNull();
  });

  it('زر «نافذة المعلم» في شريط التحكم يفتح اللوحة المدمجة', async () => {
    await act(async () => {
      root.render(<Presentation data={presentation} />);
    });
    await act(async () => {
      (container.querySelector('[aria-label^="نافذة المعلم"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="presenter-embedded"]')).toBeTruthy();
  });

  it('عقد التحكم: مفتاح N مضافة وSHORTCUTS تعرضها', () => {
    expect(KEYS.presenter).toContain('n');
    expect(KEYS.presenter).toContain('N');
    expect(SHORTCUTS.some((s) => s.keys.includes('N') && s.label.includes('نافذة المعلم'))).toBe(true);
  });
});

describe('مختبر ملاحظات المعلم — ?lab=presenter', () => {
  let root: Root;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('يُركّب بملاحظات نموذجية مرئية ومعاينتين ومؤقت', async () => {
    await act(async () => {
      root.render(<PresenterLab />);
    });
    const html = container.innerHTML;
    expect(html).toContain('ملاحظات المعلم ومؤقت العرض');
    expect(html).toContain('Reveal Notes');
    expect(container.querySelector('[data-testid="presenter-window"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="presenter-preview-current"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="presenter-preview-next"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="presenter-timer"]')).toBeTruthy();
    expect(container.querySelector('[data-testid="presenter-notes"]')?.textContent).toContain('رحّب بالحضور');

    // التنقل يبدّل الملاحظات (مزامنة نموذجية)
    await act(async () => {
      (container.querySelector('[data-testid="lab-next"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="presenter-notes"]')?.textContent).toContain('توقف هنا ثانيتين');

    await act(async () => {
      (container.querySelector('[data-testid="lab-prev"]') as HTMLButtonElement).click();
    });
    expect(container.querySelector('[data-testid="presenter-notes"]')?.textContent).toContain('رحّب بالحضور');
  });
});
