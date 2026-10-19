import { createContext, useContext, type ReactNode } from 'react';

/** Updated by Presentation as navigation changes; undefined means outside a presentation. */
export const ActiveSlideIdContext = createContext<string | null | undefined>(undefined);
const SlideMediaActivityContext = createContext<boolean | undefined>(undefined);

/** Marks media nested in a SlideScreen with whether that slide is the current slide. */
export function SlideMediaScope({ slideId, children }: { slideId: string; children: ReactNode }) {
  const activeSlideId = useContext(ActiveSlideIdContext);
  const active = activeSlideId === undefined || activeSlideId === slideId;
  return <SlideMediaActivityContext.Provider value={active}>{children}</SlideMediaActivityContext.Provider>;
}

/** Media components remain usable in standalone pages; a scope can override this via `active`. */
export function useSlideMediaActive(override?: boolean) {
  const scopedActive = useContext(SlideMediaActivityContext);
  return override ?? scopedActive ?? true;
}
