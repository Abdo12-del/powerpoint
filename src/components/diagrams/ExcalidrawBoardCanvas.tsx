import { useMemo } from 'react';
import { Excalidraw, convertToExcalidrawElements } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';
import { cn } from '@/lib/cn';
import type { ExcalidrawBoardProps } from './excalidrawTypes';

/** Kept in a lazy chunk: Excalidraw's editor/runtime is used only on hand-drawn slides. */
export default function ExcalidrawBoardCanvas({ initialData, elements, editable = false, onChange }: ExcalidrawBoardProps) {
  const scene = useMemo(
    () =>
      initialData ?? {
        elements: elements ? convertToExcalidrawElements(elements, { regenerateIds: false }) : [],
        appState: {
          theme: 'dark' as const,
          viewBackgroundColor: '#0f172a',
          exportWithDarkMode: true,
        },
        scrollToContent: true,
      },
    [elements, initialData],
  );

  return (
    <div dir="rtl" className={cn('excalidraw-host h-full w-full overflow-hidden', !editable && 'excalidraw-readonly')}>
      <Excalidraw
        initialData={scene}
        viewModeEnabled={!editable}
        theme="dark"
        langCode="ar-SA"
        autoFocus={false}
        handleKeyboardGlobally={false}
        onChange={onChange}
        UIOptions={{
          canvasActions: editable
            ? { saveToActiveFile: false, loadScene: false, toggleTheme: false }
            : { clearCanvas: false, export: false, loadScene: false, saveToActiveFile: false, saveAsImage: false, toggleTheme: false },
        }}
      />
    </div>
  );
}
