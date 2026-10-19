import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MediaGallery } from '@/components/media/MediaGallery';
import { MediaImage } from '@/components/media/MediaImage';
import { MediaVideo } from '@/components/media/MediaVideo';
import { DeviceFrame } from '@/components/media/DeviceFrame';
import { PanZoomImage } from '@/components/media/PanZoomImage';
import { ZoomImage } from '@/components/media/ZoomImage';
import { ActiveSlideIdContext, SlideMediaScope, useSlideMediaActive } from '@/components/media/slideActivity';
import { resolveMediaUrl } from '@/lib/media-url';
import { getMediaVideoPlaying } from '@/components/media/videoPlayback';

function ActivityProbe() {
  return <span data-active={String(useSlideMediaActive())} />;
}

afterEach(() => vi.unstubAllEnvs());

describe('media toolkit', () => {
  it('resolves local public assets under Vite BASE_URL without touching remote/data URLs', () => {
    vi.stubEnv('BASE_URL', '/presentation/');

    expect(resolveMediaUrl('/media/screens/intro.webp')).toBe('/presentation/media/screens/intro.webp');
    expect(resolveMediaUrl('media/posters/demo.svg')).toBe('/presentation/media/posters/demo.svg');
    expect(resolveMediaUrl('https://cdn.example.test/video.mp4')).toBe('https://cdn.example.test/video.mp4');
    expect(resolveMediaUrl('//cdn.example.test/image.webp')).toBe('//cdn.example.test/image.webp');
    expect(resolveMediaUrl('data:image/svg+xml,preview')).toBe('data:image/svg+xml,preview');
    expect(resolveMediaUrl(undefined)).toBeUndefined();
  });

  it('renders semantic, lazy images with reserved dimensions and an optional blur preview', () => {
    vi.stubEnv('BASE_URL', '/deck/');
    const html = renderToStaticMarkup(
      <MediaImage
        src="/media/screens/dashboard.webp"
        alt="لوحة تحكم المخزون"
        blurDataURL="data:image/svg+xml,blur"
        width={1600}
        height={900}
      />,
    );

    expect(html).toContain('src="/deck/media/screens/dashboard.webp"');
    expect(html).toContain('alt="لوحة تحكم المخزون"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain('aspect-ratio:1600/900');
    expect(html).toContain('data:image/svg+xml,blur');
  });

  it('keeps zoom and pan-only props off the lazy image fallbacks', () => {
    const zoomHtml = renderToStaticMarkup(
      <ZoomImage src="/media/screens/zoom.svg" alt="صورة قابلة للتكبير" zoomSrc="/media/screens/full.svg" zoomMargin={24} />,
    );
    const panHtml = renderToStaticMarkup(
      <PanZoomImage src="/media/screens/pan.svg" alt="صورة قابلة للتحريك" viewerHeight={360} minScale={0.5} maxScale={5} />,
    );

    expect(zoomHtml).toContain('alt="صورة قابلة للتكبير"');
    expect(zoomHtml).not.toContain('zoomSrc=');
    expect(zoomHtml).not.toContain('zoomMargin=');
    expect(panHtml).toContain('alt="صورة قابلة للتحريك"');
    expect(panHtml).not.toContain('viewerHeight=');
    expect(panHtml).not.toContain('minScale=');
    expect(panHtml).not.toContain('maxScale=');
  });

  it('wraps screenshots in browser, phone, and tablet device figures', () => {
    for (const device of ['browser', 'phone', 'tablet'] as const) {
      const html = renderToStaticMarkup(
        <DeviceFrame device={device} src="/media/screens/device.svg" alt="لقطة شاشة تطبيق" caption="معاينة" />,
      );
      expect(html).toContain('<figure');
      expect(html).toContain('aria-label="معاينة"');
      expect(html).toContain('alt="لقطة شاشة تطبيق"');
      expect(html).toContain('معاينة');
      expect(html).toContain('loading="lazy"');
    }
  });

  it('marks only the current slide as active, and goes inactive on presentation screens', () => {
    const html = renderToStaticMarkup(
      <ActiveSlideIdContext.Provider value="slide-a">
        <SlideMediaScope slideId="slide-a"><ActivityProbe /></SlideMediaScope>
        <SlideMediaScope slideId="slide-b"><ActivityProbe /></SlideMediaScope>
      </ActiveSlideIdContext.Provider>,
    );
    expect(html).toContain('<span data-active="true"></span>');
    expect(html).toContain('<span data-active="false"></span>');

    const nonSlideHtml = renderToStaticMarkup(
      <ActiveSlideIdContext.Provider value={null}>
        <SlideMediaScope slideId="slide-a"><ActivityProbe /></SlideMediaScope>
      </ActiveSlideIdContext.Provider>,
    );
    expect(nonSlideHtml).toContain('<span data-active="false"></span>');
  });

  it('lets an explicit activity override take precedence over the slide scope', () => {
    function OverrideProbe() {
      return <span data-active={String(useSlideMediaActive(false))} />;
    }
    const html = renderToStaticMarkup(
      <ActiveSlideIdContext.Provider value="slide-a">
        <SlideMediaScope slideId="slide-a"><OverrideProbe /></SlideMediaScope>
      </ActiveSlideIdContext.Provider>,
    );
    expect(html).toContain('<span data-active="false"></span>');
  });

  it('autoplays only while the slide is active and respects manual pause', () => {
    expect(getMediaVideoPlaying(true, true, false)).toBe(true);
    expect(getMediaVideoPlaying(true, true, true)).toBe(false);
    expect(getMediaVideoPlaying(true, false, false)).toBeUndefined();
    expect(getMediaVideoPlaying(false, true, false)).toBe(false);
    expect(getMediaVideoPlaying(false, false, false)).toBe(false);
  });

  it('does not instantiate the player until a source is provided', () => {
    const html = renderToStaticMarkup(<MediaVideo src="" />);
    expect(html).toContain('role="status"');
    expect(html).toContain('أضف رابط فيديو');
    expect(html).not.toContain('react-player');
  });

  it('provides a lazy loading state for the RTL image carousel', () => {
    const html = renderToStaticMarkup(
      <MediaGallery direction="rtl" items={[{ src: '/media/screens/one.svg', alt: 'الصورة الأولى' }]} />,
    );
    expect(html).toContain('جارٍ تحميل معرض الصور');
    expect(html).toContain('aspect-ratio:16/9');
  });
});
