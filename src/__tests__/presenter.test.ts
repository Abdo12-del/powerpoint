// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { PresenterTimer, formatElapsed, wallClock } from '@/presenter/timer';
import { notesFor, screenInfo, slidesOf, slideById } from '@/presenter/notes';
import { buildSequence, flattenSlides } from '@/lib/navigation';
import { Info, Layers, Lightbulb, Target } from 'lucide-react';
import type { PresentationData } from '@/types/presentation';

/** بيانات نموذجية بملاحظات على كل عقدة */
const DATA: PresentationData = {
  meta: {
    organization: ['الجامعة'],
    workType: 'مذكرة',
    title: 'عرض الاختبار',
    authors: [],
    date: '2026',
    notes: 'ملاحظات شاشة العنوان: ابدأ بسؤال.',
  },
  preface: [
    { id: 'p1', kind: 'problem', title: 'الإشكالية', icon: Lightbulb, content: null, notes: 'ملاحظة الإشكالية: توقّف هنا.' },
    { id: 'p2', kind: 'objectives', title: 'الأهداف', icon: Target, content: null },
  ],
  chapters: [
    {
      id: 'ch1',
      title: 'الفصل الأول',
      icon: Layers,
      color: 'from-sky-600/20 to-sky-400/10',
      accent: 'text-sky-200 border-sky-400/40',
      slides: [
        { id: 'ch1-a', chapterId: 'ch1', title: 'المحور أ', icon: Info, archetype: 'bullets', content: null, notes: 'ملاحظة المحور أ.' },
        { id: 'ch1-b', chapterId: 'ch1', title: 'المحور ب', icon: Info, archetype: 'stats', content: null },
      ],
    },
  ],
  final: {
    title: 'الخاتمة',
    summary: ['خلاصة'],
    closing: 'إغلاق',
    thanks: 'شكراً',
    notes: 'ملاحظة الخاتمة: افتح باب الأسئلة.',
  },
};

const slides = flattenSlides(DATA.chapters);
const sequence = buildSequence(DATA);

describe('تنسيق المؤقت', () => {
  it('MM:SS تحت الساعة وH:MM:SS بعدها', () => {
    expect(formatElapsed(0)).toBe('00:00');
    expect(formatElapsed(5)).toBe('00:05');
    expect(formatElapsed(59)).toBe('00:59');
    expect(formatElapsed(60)).toBe('01:00');
    expect(formatElapsed(3599)).toBe('59:59');
    expect(formatElapsed(3600)).toBe('1:00:00');
    expect(formatElapsed(3661)).toBe('1:01:01');
  });

  it('القيم السالبة والكسور تُقصّ إلى أعداد صحيحة غير سالبة', () => {
    expect(formatElapsed(-5)).toBe('00:00');
    expect(formatElapsed(90.9)).toBe('01:30');
  });

  it('ساعة الحائط بصيغة HH:MM', () => {
    expect(wallClock(new Date(2026, 0, 1, 9, 5))).toBe('09:05');
    expect(wallClock(new Date(2026, 0, 1, 23, 59))).toBe('23:59');
  });
});

describe('مؤقت المعلم — PresenterTimer', () => {
  it('العدّ من نقطة البدء والحالة تعمل', () => {
    const t = new PresenterTimer();
    expect(t.running).toBe(false);
    expect(t.elapsed(100)).toBe(0);
    t.start(10);
    expect(t.running).toBe(true);
    expect(t.elapsed(25)).toBe(15);
    expect(t.formatted(25)).toBe('00:15');
  });

  it('الإيقاف المؤقت يجمد الزمن والاستئناف يجمع الفترات', () => {
    const t = new PresenterTimer();
    t.start(0);
    t.pause(30); // 30 ثانية
    expect(t.running).toBe(false);
    expect(t.elapsed(1000)).toBe(30); // الزمن توقف
    t.start(1000); // استئناف بعد انقطاع
    expect(t.elapsed(1010)).toBe(40); // 30 + 10
    t.pause(1020);
    expect(t.elapsed(99999)).toBe(50);
  });

  it('start المكرر لا يعيد التصفير وreset يصفّر ويوقف', () => {
    const t = new PresenterTimer();
    t.start(0);
    t.start(50); // تجاهل
    expect(t.elapsed(60)).toBe(60);
    t.reset();
    expect(t.running).toBe(false);
    expect(t.elapsed(100)).toBe(0);
  });
});

describe('ملاحظات المعلم — notesFor (مخفية عن الطلاب)', () => {
  it('كل نوع شاشة يقرأ ملاحظاته من بياناته', () => {
    expect(notesFor({ kind: 'title' }, DATA, slides)).toBe('ملاحظات شاشة العنوان: ابدأ بسؤال.');
    expect(notesFor({ kind: 'preface', step: 0 }, DATA, slides)).toBe('ملاحظة الإشكالية: توقّف هنا.');
    expect(notesFor({ kind: 'preface', step: 1 }, DATA, slides)).toBe(''); // بلا ملاحظات
    expect(notesFor({ kind: 'map' }, DATA, slides)).toBe('');
    expect(notesFor({ kind: 'slide', index: 0 }, DATA, slides)).toBe('ملاحظة المحور أ.');
    expect(notesFor({ kind: 'slide', index: 1 }, DATA, slides)).toBe('');
    expect(notesFor({ kind: 'final' }, DATA, slides)).toBe('ملاحظة الخاتمة: افتح باب الأسئلة.');
  });

  it('أرقام خارج النطاق ترجع سلسلة فارغة بلا انهيار', () => {
    expect(notesFor({ kind: 'slide', index: 99 }, DATA, slides)).toBe('');
    expect(notesFor({ kind: 'preface', step: 99 }, DATA, slides)).toBe('');
  });
});

describe('معلومات الشاشة — screenInfo', () => {
  it('العدّاد بنفس صيغة شريط التحكم والعنوان من البيانات', () => {
    expect(screenInfo({ kind: 'title' }, DATA, slides)).toMatchObject({ counter: 'شاشة العنوان', title: 'عرض الاختبار' });
    expect(screenInfo({ kind: 'preface', step: 0 }, DATA, slides)).toMatchObject({ counter: 'المقدمة 1 / 2', title: 'الإشكالية' });
    expect(screenInfo({ kind: 'map' }, DATA, slides).counter).toBe('خريطة الفصول');
    expect(screenInfo({ kind: 'slide', index: 1 }, DATA, slides)).toMatchObject({
      counter: 'الشريحة 2 / 2',
      title: 'المحور ب',
      chapter: 'الفصل الأول',
      slideId: 'ch1-b',
    });
    expect(screenInfo({ kind: 'final' }, DATA, slides)).toMatchObject({ counter: 'الخاتمة', title: 'الخاتمة' });
  });
});

describe('مساعدات الشرائح', () => {
  it('slidesOf يُسطّح ويجد slideById', () => {
    expect(slidesOf(DATA)).toHaveLength(2);
    expect(slideById(slides, 'ch1-a')?.title).toBe('المحور أ');
    expect(slideById(slides, 'مفقود')).toBeUndefined();
  });

  it('التسلسل الكامل يطابق بنية العرض (عنوان + مقدمة + خريطة + شرائح + خاتمة)', () => {
    expect(sequence.map((s) => s.kind)).toEqual(['title', 'preface', 'preface', 'map', 'slide', 'slide', 'final']);
  });
});
