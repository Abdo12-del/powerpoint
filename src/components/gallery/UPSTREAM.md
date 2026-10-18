# مصدر مكونات المعرض (Provenance)

كل الملفات هنا **مستعارة من مشاريع مفتوحة برخصة MIT** ومُكيَّفة لهذا القالب. النصوص الكاملة للرخص في `LICENSES/`.

| المصدر | المستودع | الالتزام (commit) | الرخصة |
|---|---|---|---|
| Magic UI | https://github.com/magicuidesign/magicui — `apps/www/registry/magicui/<name>.tsx` | `efe76fc5755eca1142dd4f74c1d6f0ace2887e3c` (2026-10-17) | MIT © Magic UI |
| motion-primitives | https://github.com/ibelick/motion-primitives — `components/core/<name>.tsx` | `120f64f6ca60348e251f929e9c81f11ccbe45eda` (2026-09-28) | MIT (انظر `LICENSES/motion-primitives.LICENCE.md`) |

## الملفات

| الملف | المصدر | ملاحظات التكييف |
|---|---|---|
| animated-beam, animated-circular-progress-bar, animated-gradient-text, animated-grid-pattern, animated-list, animated-shiny-text, aurora-text, avatar-circles, blur-fade, border-beam, dot-pattern, flickering-grid, grid-pattern, iphone, meteors, neon-gradient-card, number-ticker, orbiting-circles, ripple, safari, shimmer-button, shine-border, sparkles-text, terminal, warp-background, word-rotate | Magic UI | تكييف عام فقط (أدناه) |
| marquee | Magic UI | + `dir="ltr"` افتراضي على الحاوية (الحلقة تُحسب بـ translateX سالب) |
| magic-card | Magic UI | أُزيل `next-themes`؛ القالب داكن دائماً (`isDarkTheme = true`) |
| text-animate | Magic UI | حارس العربية: `by="character"` يتحوّل تلقائياً إلى `word` إذا احتوى النص حروفاً عربية (قاعدة §9.5) |
| glow-effect, image-comparison, transition-panel | motion-primitives | استيرادات الأنواع بـ `type` (verbatimModuleSyntax)، `BASE_TRANSITION: Transition` |

### التكييف العام المطبّق على الجميع
- حُذف `"use client"` (Vite لا يحتاجه).
- `from "motion/react"` → `from "framer-motion"` (نفس الواجهة البرمجية في الإصدار 12).
- `from "@/lib/utils"` → `from "@/lib/cn"` (`cn` = clsx + tailwind-merge كما في shadcn).
- إطارات الحركة (`@keyframes` و`--animate-*`) مجمّعة في `src/styles/gallery.css`.

### مكونات عُرضت ولم تُستعر (ولماذا)
`file-tree` (يحتاج radix + shadcn)، `morphing-dialog`/`sliding-number` (تبعيات إضافية)، `retro-grid` (WebGL ضخم)، `globe`/`icon-cloud` (cobe/canvas)، `hyper-text`/`flip-text`/`morphing-text`/`spinning-text`/`text-roll`/`text-scramble` (تفكّك الحروف — ممنوع للعربية)، `typing-animation`/`highlighter`/`confetti`/`particles` (مغطاة في `effects/`).

## تحديث نسخة
```bash
# مثال: جلب نسخة أحدث من مكوّن واحد (يتطلب gh)
gh api repos/magicuidesign/magicui/contents/apps/www/registry/magicui/marquee.tsx --jq .content | base64 -d > /tmp/marquee.tsx
# ثم طبّق التكييف العام أعلاه وحدّث الجدول وجرّب: npm run check
```
