import { Landmark } from 'lucide-react';
import type { PresentationBranding } from '@/types/presentation';

/** ترويسة الجهة وذيل العرض؛ كلاهما ثابت داخل مساحة العرض ولا يزاحم شريط التحكم. */
export function BrandChrome({ branding }: { branding?: PresentationBranding }) {
  const university = branding?.university?.trim() ?? '';
  const unit = branding?.unit?.trim() ?? '';
  const logoSrc = branding?.logoSrc?.trim() ?? '';
  const footer = branding?.footer?.trim() ?? '';
  const showHeader = Boolean(university || unit || logoSrc);

  if (!showHeader && !footer) return null;

  return (
    <>
      {showHeader && (
        <header className="brand-chrome-header" dir="rtl" aria-label={university || 'هوية الجهة'}>
          {logoSrc ? (
            <img className="brand-chrome-logo" src={logoSrc} alt={branding?.logoAlt?.trim() || university || 'شعار الجامعة'} />
          ) : (
            <span className="brand-chrome-mark" aria-hidden="true">
              <Landmark className="h-4 w-4" />
            </span>
          )}
          <span className="brand-chrome-header-copy">
            {university && <span className="brand-chrome-university block">{university}</span>}
            {unit && <span className="brand-chrome-unit block">{unit}</span>}
          </span>
        </header>
      )}
      {footer && (
        <footer className="brand-chrome-footer" dir="rtl" aria-label="تذييل العرض">
          <span>{footer}</span>
        </footer>
      )}
    </>
  );
}
