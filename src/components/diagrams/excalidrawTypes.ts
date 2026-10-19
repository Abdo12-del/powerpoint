import type { ExcalidrawInitialDataState, ExcalidrawProps } from '@excalidraw/excalidraw/types';
import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform';

export type ExcalidrawBoardOnChange = NonNullable<ExcalidrawProps['onChange']>;

export interface ExcalidrawBoardProps {
  height?: number | string;
  className?: string;
  /** Raw scene payload from Excalidraw, if you already have one. */
  initialData?: ExcalidrawInitialDataState | null;
  /** Optional simplified shape definitions, converted to a scene lazily. */
  elements?: ExcalidrawElementSkeleton[];
  /** Read-only by default to keep presentation slides safe to navigate. */
  editable?: boolean;
  onChange?: ExcalidrawBoardOnChange;
}
