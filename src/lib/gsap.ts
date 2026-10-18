import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { TextPlugin } from 'gsap/TextPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

/**
 * GSAP مُهيّأ مرة واحدة لكل المشروع (كل الإضافات مجانية منذ 3.13).
 * استورد من هنا دائماً: import { gsap, useGSAP, splitWords } from '@/lib/gsap'
 */
gsap.registerPlugin(useGSAP, SplitText, Flip, TextPlugin, MotionPathPlugin);

export { gsap, useGSAP, SplitText, Flip, TextPlugin, MotionPathPlugin };

type SplitVars = NonNullable<Parameters<typeof SplitText.create>[1]>;

/**
 * تقسيم نص آمن للعربية: كلمات (وأسطر اختيارياً) فقط — **لا حروف أبداً** (قاعدة §9.5).
 * استعمله بدل `new SplitText(el, { type: 'chars' })` الذي يكسر اتصال الحروف العربية.
 *
 * @example
 * const split = splitWords(titleRef.current);
 * gsap.from(split.words, { y: 20, opacity: 0, stagger: 0.06 });
 */
export function splitWords(target: gsap.DOMTarget, vars: Omit<SplitVars, 'type'> & { lines?: boolean } = {}) {
  const { lines, ...rest } = vars;
  return SplitText.create(target, { ...rest, type: lines ? 'words,lines' : 'words' });
}
