import { useCallback, useMemo, useReducer } from 'react';
import type { PresentationData } from '@/types/presentation';
import {
  buildSequence,
  escapeScreen,
  flattenSlides,
  nextScreen,
  positionOf,
  prevScreen,
  progressOf,
  sameScreen,
  type FlatSlide,
  type Screen,
} from '@/lib/navigation';

export type Direction = 1 | -1;

interface State {
  screen: Screen;
  /** اتجاه الحركة الأخير — يُستعمل في أنيميشن الانتقال */
  direction: Direction;
  /** آخر شريحة زارها المشاهد */
  lastSlide: number;
  /** معرفات الشرائح التي زارها المشاهد (لعلامات الخريطة) */
  visited: string[];
}

type Action =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'map' }
  | { type: 'escape' }
  | { type: 'restart' }
  | { type: 'goto'; screen: Screen };

const initialState: State = {
  screen: { kind: 'title' },
  direction: 1,
  lastSlide: 0,
  visited: [],
};

function makeReducer(slides: FlatSlide[], prefaceCount: number) {
  const ctxOf = (state: State) => ({ prefaceCount, slideCount: slides.length, lastSlide: state.lastSlide });

  const move = (state: State, target: Screen, direction: Direction): State => {
    if (sameScreen(state.screen, target)) return state;
    let { lastSlide, visited } = state;
    if (target.kind === 'slide') {
      lastSlide = target.index;
      const id = slides[target.index]?.slide.id;
      if (id && !visited.includes(id)) visited = [...visited, id];
    }
    return { screen: target, direction, lastSlide, visited };
  };

  return (state: State, action: Action): State => {
    switch (action.type) {
      case 'next':
        return move(state, nextScreen(state.screen, ctxOf(state)), 1);
      case 'prev':
        return move(state, prevScreen(state.screen, ctxOf(state)), -1);
      case 'map':
        return move(state, { kind: 'map' }, state.screen.kind === 'slide' || state.screen.kind === 'final' ? -1 : 1);
      case 'escape':
        return move(state, escapeScreen(state.screen), -1);
      case 'restart':
        return { ...initialState, visited: state.visited };
      case 'goto': {
        const dir: Direction =
          action.screen.kind === 'slide' && state.screen.kind === 'slide'
            ? action.screen.index >= state.screen.index
              ? 1
              : -1
            : 1;
        return move(state, action.screen, dir);
      }
    }
  };
}

/**
 * آلة حالة العرض: تنفّذ عقد التدفق (§6) وتوفّر كل ما تحتاجه الشاشات.
 */
export function usePresentation(data: PresentationData) {
  const slides = useMemo(() => flattenSlides(data.chapters), [data.chapters]);
  const sequence = useMemo(() => buildSequence(data), [data]);
  const reducer = useMemo(() => makeReducer(slides, data.preface.length), [slides, data.preface.length]);
  const [state, dispatch] = useReducer(reducer, initialState);

  const next = useCallback(() => dispatch({ type: 'next' }), []);
  const prev = useCallback(() => dispatch({ type: 'prev' }), []);
  const openMap = useCallback(() => dispatch({ type: 'map' }), []);
  const escape = useCallback(() => dispatch({ type: 'escape' }), []);
  const restart = useCallback(() => dispatch({ type: 'restart' }), []);
  const goto = useCallback((screen: Screen) => dispatch({ type: 'goto', screen }), []);
  const gotoSlide = useCallback((index: number) => dispatch({ type: 'goto', screen: { kind: 'slide', index } }), []);

  const current = state.screen.kind === 'slide' ? slides[state.screen.index] : undefined;
  const currentChapterId =
    current?.chapter.id ?? (state.visited.length > 0 ? slides[state.lastSlide]?.chapter.id : undefined);

  return {
    screen: state.screen,
    direction: state.direction,
    visited: state.visited,
    lastSlide: state.lastSlide,
    slides,
    sequence,
    current,
    currentChapterId,
    position: positionOf(state.screen, sequence),
    progress: progressOf(state.screen, sequence),
    total: sequence.length,
    next,
    prev,
    openMap,
    escape,
    restart,
    goto,
    gotoSlide,
  };
}

export type PresentationController = ReturnType<typeof usePresentation>;
