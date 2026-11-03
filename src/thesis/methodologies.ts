/**
 * Discipline-aware thesis defense blueprints.
 * These are adaptable academic defaults, not institutionally mandated slide plans.
 */
export type ThesisMethodologyId =
  | 'general-research'
  | 'experimental-sciences'
  | 'health-clinical'
  | 'engineering'
  | 'digital-systems'
  | 'business-social'
  | 'humanities-law'
  | 'education'
  | 'architecture-design'
  | 'vocational-project'
  | 'mathematics-statistics'
  | 'earth-universe-sciences'
  | 'sports-sciences'
  | 'language-literature'
  | 'arts-creative';

export interface MethodologyStep {
  id: string;
  titleAr: string;
  purposeAr: string;
  contentHintsAr: string[];
  visualHintsAr: string[];
  optional?: boolean;
}

export interface ThesisMethodology {
  id: ThesisMethodologyId;
  titleAr: string;
  summaryAr: string;
  /** Specialty names and unambiguous keywords; matched against the student's stated specialty first. */
  specialtyAliases: string[];
  /** A narrative sequence, not a required slide count. Merge or split sections to fit the allotted time. */
  sequence: MethodologyStep[];
  guardrailsAr: string[];
}

export const THESIS_METHODOLOGIES: readonly ThesisMethodology[] = [
  {
    id: 'general-research',
    titleAr: 'بحث أكاديمي عام',
    summaryAr: 'خطة احتياطية عندما لا تكفي بيانات المذكرة لتحديد تخصص أو نوع دراسة بثقة.',
    specialtyAliases: [],
    sequence: [
      { id: 'context', titleAr: 'السياق والفجوة', purposeAr: 'تحديد الموضوع وسبب أهميته والفجوة التي يعالجها العمل.', contentHintsAr: ['سياق موجز', 'ما الذي لا يزال غير محسوم؟'], visualHintsAr: ['صورة أو رسم مفاهيمي موثق'] },
      { id: 'question', titleAr: 'الإشكالية والأهداف', purposeAr: 'صياغة سؤال مركزي ثم أهداف متطابقة معه.', contentHintsAr: ['سؤال واحد', 'أهداف قابلة للتحقق', 'فرضيات إذا استعملتها المذكرة فعلاً'], visualHintsAr: ['سؤال بارز أو مخطط هدف-سؤال'] },
      { id: 'framework', titleAr: 'الإطار الضروري', purposeAr: 'عرض المفاهيم أو الدراسات السابقة التي يحتاجها الجمهور لفهم القرار البحثي.', contentHintsAr: ['مفهومان أو ثلاثة', 'الدراسات الأقرب فقط'], visualHintsAr: ['خريطة مفاهيم أو مقارنة مختصرة'], optional: true },
      { id: 'method', titleAr: 'المنهجية والمواد', purposeAr: 'شرح كيف أُنجز العمل ولماذا تلائم الطريقة سؤال البحث.', contentHintsAr: ['التصميم', 'الميدان أو العينة/المصادر', 'الأداة والإجراء', 'الأخلاقيات عند انطباقها'], visualHintsAr: ['مخطط مراحل أو بطاقة تصميم الدراسة'] },
      { id: 'findings', titleAr: 'النتائج الأساسية', purposeAr: 'اختيار النتائج التي تجيب مباشرة عن الأهداف.', contentHintsAr: ['نتائج موثقة بالمذكرة', 'وحدات ومقامات واضحة'], visualHintsAr: ['رسم أو جدول مبسط أو مقتطف موثق'] },
      { id: 'interpretation', titleAr: 'المناقشة والمساهمة', purposeAr: 'تفسير النتائج وربطها بالسؤال والأدبيات دون إعادة سردها.', contentHintsAr: ['ما الذي تعنيه النتائج؟', 'ما الإضافة الفعلية؟'], visualHintsAr: ['مقارنة قبل/بعد أو نموذج تفسيري'], optional: true },
      { id: 'limits', titleAr: 'الحدود والآفاق', purposeAr: 'ذكر القيود ذات الأثر والاقتراحات الواقعية.', contentHintsAr: ['حد أو اثنان من المذكرة', 'تحسين أو بحث تالٍ'], visualHintsAr: ['قائمة موجزة'], optional: true },
      { id: 'conclusion', titleAr: 'الخلاصة والأسئلة', purposeAr: 'إجابة السؤال في ضوء ما توصل إليه العمل، ثم فتح باب النقاش.', contentHintsAr: ['جواب مباشر', 'خلاصة لا تضيف بيانات جديدة'], visualHintsAr: ['رسالة ختامية واحدة'] },
    ],
    guardrailsAr: ['لا تُحوّل هذا الهيكل إلى قالب إلزامي.', 'إذا بقي التخصص أو نوع الدراسة ملتبساً، اعرض الاحتمالات واسأل قبل بناء الشرائح.'],
  },
  {
    id: 'experimental-sciences',
    titleAr: 'العلوم التجريبية والطبيعية',
    summaryAr: 'للأعمال التي تختبر فرضية أو تقيس ظاهرة مخبرية أو ميدانية.',
    specialtyAliases: ['biology', 'biologie', 'علوم الطبيعة', 'علوم الحياة', 'علوم الطبيعة والحياة', 'علوم بيولوجية', 'علوم المادة', 'science de la matière', 'microbiology', 'ميكروبيولوجيا', 'agronomie', 'agronomy', 'فلاحة', 'علوم زراعية', 'ecology', 'بيئة', 'chemistry', 'chimie', 'كيمياء', 'chimie analytique', 'chimie organique', 'chimie pharmaceutique', 'chimie macromoléculaire', 'polymères', 'physics', 'physique', 'فيزياء', 'physique fondamentale', 'physique théorique', 'physique des matériaux', 'physique énergétique', 'matériaux', 'مواد', 'biotechnologie', 'biotechnology', 'génétique', 'genetics', 'وراثة', 'biologie moléculaire', 'molecular biology', 'immunologie', 'immunology', 'toxicologie', 'toxicology', 'علوم بحرية', 'sciences de la mer', 'aquaculture', 'production végétale', 'production animale', 'plant production', 'animal production', 'sciences forestières', 'علوم الغابات', 'nutrition', 'تغذية', 'protection des végétaux', 'حماية النباتات'],
    sequence: [
      { id: 'question', titleAr: 'المشكلة والفرضية', purposeAr: 'إظهار الفجوة والسؤال أو الفرضية القابلة للاختبار.', contentHintsAr: ['السياق العلمي', 'الهدف/الفرضية'], visualHintsAr: ['رسم يوضح العلاقة المتوقعة'] },
      { id: 'design', titleAr: 'تصميم الدراسة', purposeAr: 'تعريف التصميم والعينة أو المادة ومكان/فترة الدراسة.', contentHintsAr: ['المجموعات أو العينات', 'المتغيرات', 'الموافقات الأخلاقية'], visualHintsAr: ['مخطط تصميم التجربة أو خريطة الموقع'] },
      { id: 'protocol', titleAr: 'المواد والإجراءات', purposeAr: 'إظهار البروتوكول الذي يتيح فهم النتائج وإمكان تكرارها.', contentHintsAr: ['المواد والأجهزة المهمة', 'خطوات القياس', 'ضبط الجودة'], visualHintsAr: ['مسار إجرائي أو صور مختبرية أصلية'] },
      { id: 'analysis', titleAr: 'طريقة تحليل البيانات', purposeAr: 'ذكر الاختبارات أو المعايير والتحقق منها دون إغراق تقني.', contentHintsAr: ['المقياس والوحدات', 'الاختبار الإحصائي عند استعماله'], visualHintsAr: ['مخطط سير التحليل'] },
      { id: 'results', titleAr: 'النتائج حسب الأهداف', purposeAr: 'ترتيب النتائج على محاور الدراسة لا على ترتيب صفحات المذكرة.', contentHintsAr: ['أهم 2–4 نتائج', 'حجم العينة والمقام', 'الدلالة/عدم اليقين إن وُجد'], visualHintsAr: ['رسوم/جداول مقروءة ومحاور معرّفة'] },
      { id: 'discussion', titleAr: 'التفسير والحدود', purposeAr: 'تفسير النمط ومقارنته بالدراسات مع توضيح القيود.', contentHintsAr: ['تفسير علمي', 'اتفاق/اختلاف مع الأدبيات', 'قيود التصميم'], visualHintsAr: ['رسم تفسيري أو مقارنة مرجعية'] },
      { id: 'conclusion', titleAr: 'الاستنتاج والآفاق', purposeAr: 'الإجابة عن السؤال وربطها بالتطبيق أو البحث التالي.', contentHintsAr: ['استنتاج مدعوم', 'اقتراح تالٍ'], visualHintsAr: ['خلاصة بصرية واحدة'] },
    ],
    guardrailsAr: ['لا تعرض ارتباطاً على أنه سببية.', 'لا تخترع دلالة إحصائية أو نتائج غير موجودة.', 'اعرض الوحدات وحجم العينة ومصدر الصور.'],
  },
  {
    id: 'health-clinical',
    titleAr: 'العلوم الصحية والسريرية',
    summaryAr: 'للطب والصيدلة وطب الأسنان والبيطرة والتمريض والأعمال الصحية التطبيقية.',
    specialtyAliases: ['medicine', 'médecine', 'طب', 'médecine générale', 'طب عام', 'pharmacy', 'pharmacie', 'صيدلة', 'dentistry', 'médecine dentaire', 'طب الأسنان', 'veterinary', 'vétérinaire', 'médecine vétérinaire', 'طب بيطري', 'بيطرة', 'nursing', 'soins infirmiers', 'تمريض', 'paramédical', 'شبه طبي', 'public health', 'santé publique', 'صحة عمومية', 'clinical', 'سريري', 'cardiologie', 'طب القلب', 'pédiatrie', 'طب الأطفال', 'chirurgie', 'surgery', 'anesthésie', 'anesthésie réanimation', 'imagerie médicale', 'radiologie', 'biologie médicale', 'parasitologie', 'épidémiologie', 'epidemiology', 'médecine du travail', 'hygiène hospitalière', 'nutrition clinique', 'orthophonie', 'kinésithérapie', 'sage femme', 'قابلة', 'sciences médicales', 'علوم طبية'],
    sequence: [
      { id: 'clinical-context', titleAr: 'السياق والسؤال الصحي', purposeAr: 'تعريف المشكلة الصحية أو السريرية وسبب دراستها.', contentHintsAr: ['السياق دون بيانات تعريفية', 'سؤال/هدف واضح'], visualHintsAr: ['مخطط أو شكل تشريحي مرخّص ومجهّل'] },
      { id: 'design-ethics', titleAr: 'التصميم والأخلاقيات', purposeAr: 'تحديد نوع الدراسة والمكان والفترة ومعايير الاشتمال والموافقات.', contentHintsAr: ['تصميم الدراسة', 'حجم العينة', 'موافقة أخلاقية/موافقة المشاركين عند وجودها'], visualHintsAr: ['مخطط اختيار المشاركين'] },
      { id: 'methods', titleAr: 'الإجراء أو التدخل', purposeAr: 'شرح القياس أو التدخل أو بروتوكول التحليل.', contentHintsAr: ['المقياس والنتيجة الأساسية', 'الإجراء أو العلاج كما ورد'], visualHintsAr: ['خطوات بروتوكول مبسطة'] },
      { id: 'results', titleAr: 'النتائج السريرية', purposeAr: 'عرض النتائج ذات الصلة بالسؤال وبالترتيب نفسه للأهداف.', contentHintsAr: ['أعداد ومقامات', 'تقديرات وعدم يقين إن توفرت'], visualHintsAr: ['مخطط تدفق أو رسوم نتائج'] },
      { id: 'interpretation', titleAr: 'المناقشة والسلامة', purposeAr: 'شرح الدلالة العملية ومقارنتها بالأدبيات وبيان حدود التعميم.', contentHintsAr: ['المعنى السريري', 'القيود', 'السلامة أو الآثار إن تناولتها المذكرة'], visualHintsAr: ['مقارنة موجزة بالمرجع'] },
      { id: 'conclusion', titleAr: 'الخلاصة والتوصية', purposeAr: 'إجابة محددة ضمن قوة الأدلة، ثم اقتراح قابل للتنفيذ.', contentHintsAr: ['جواب دون مبالغة', 'توصية مدعومة'], visualHintsAr: ['رسالة واحدة'] },
    ],
    guardrailsAr: ['احذف أو عمّم أي بيانات شخصية أو صور مرضى يمكن أن تكشف هويتهم.', 'لا تقدّم توصية علاجية أو ادعاء سببي يتجاوز تصميم الدراسة.', 'أظهر الموافقات والقيود فقط كما توثقها المذكرة.'],
  },
  {
    id: 'engineering',
    titleAr: 'الهندسة والعلوم التطبيقية',
    summaryAr: 'للتصميم والتحليل الهندسي والتجارب والأنظمة المادية.',
    specialtyAliases: ['génie civil', 'هندسة مدنية', 'génie mécanique', 'هندسة ميكانيكية', 'génie électrique', 'هندسة كهربائية', 'génie des procédés', 'هندسة الطرائق', 'industrial engineering', 'هندسة صناعية', 'materials engineering', 'هندسة المواد', 'telecommunications', 'اتصالات', 'aéronautique', 'aeronautics', 'طيران', 'génie biomédical', 'هندسة طبية حيوية', 'mines', 'génie minier', 'هندسة المناجم', 'travaux publics', 'أشغال عمومية', 'électromécanique', 'كهروميكانيك', 'automatique', 'أتمتة', 'hydrocarbures', 'محروقات', 'construction mécanique', 'بناء ميكانيكي', 'énergétique', 'طاقة', 'génie maritime', 'هندسة بحرية', 'métallurgie', 'معادن', 'hygiène et sécurité industrielle', 'سلامة صناعية', 'ingénierie des transports', 'هندسة النقل', 'optique et photonique', 'بصريات وفوتونيات'],
    sequence: [
      { id: 'need', titleAr: 'الحاجة والقيود', purposeAr: 'تعريف المشكلة العملية والمستخدم والقيود والمواصفات.', contentHintsAr: ['الوضع الحالي', 'متطلبات قابلة للقياس', 'قيود السلامة/الكلفة'], visualHintsAr: ['مخطط المشكلة أو جدول متطلبات'] },
      { id: 'design', titleAr: 'البدائل والتصميم', purposeAr: 'عرض البدائل ومعيار اختيار الحل وبنية التصميم.', contentHintsAr: ['بدائل مختارة', 'الحسابات/المعايير الحاسمة'], visualHintsAr: ['رسم هندسي أو مخطط بنية'] },
      { id: 'implementation', titleAr: 'الإنجاز أو المحاكاة', purposeAr: 'شرح ما تم بناؤه أو نمذجته وكيف.', contentHintsAr: ['المعدات والمواد', 'إعدادات المحاكاة أو خطوات التصنيع'], visualHintsAr: ['صور أصلية أو مخطط عملية'] },
      { id: 'verification', titleAr: 'الاختبار والتحقق', purposeAr: 'بيان معايير النجاح وظروف الاختبار ومقارنة المتوقع بالمقاس.', contentHintsAr: ['معايير القبول', 'تكرار الاختبار', 'خطأ القياس إن توفر'], visualHintsAr: ['مخطط تحقق أو مقارنة متوقع/مقاس'] },
      { id: 'results', titleAr: 'الأداء والنتائج', purposeAr: 'إظهار أداء الحل تجاه المواصفات والهدف.', contentHintsAr: ['المقاييس المهمة', 'الكلفة/الطاقة/الزمن إن قيست'], visualHintsAr: ['رسم أداء أو جدول مواصفات'] },
      { id: 'limits', titleAr: 'الحدود والتحسين', purposeAr: 'إظهار ما لم يتحقق وما يلزم قبل التطبيق.', contentHintsAr: ['حدود فنية', 'مخاطر أو قيود ميدانية'], visualHintsAr: ['خارطة تحسين قصيرة'], optional: true },
      { id: 'conclusion', titleAr: 'القرار والتوصية', purposeAr: 'تلخيص مدى تلبية الحل للمتطلبات.', contentHintsAr: ['ماذا تحقق؟', 'العمل التالي'], visualHintsAr: ['مصفوفة متطلبات مختصرة'] },
    ],
    guardrailsAr: ['ميّز بين نتائج المحاكاة والاختبار الواقعي.', 'لا تدّعِ المطابقة أو السلامة دون معيار/اختبار موثق.'],
  },
  {
    id: 'digital-systems',
    titleAr: 'الإعلام الآلي والنظم الرقمية',
    summaryAr: 'للبرمجيات والذكاء الاصطناعي والبيانات والشبكات والأمن ونظم المعلومات.',
    specialtyAliases: ['computer science', 'informatique', 'الإعلام الآلي', 'علوم الحاسوب', 'systèmes informatiques', 'أنظمة معلوماتية', 'computer systems', 'software engineering', 'génie logiciel', 'هندسة البرمجيات', 'artificial intelligence', 'intelligence artificielle', 'ذكاء اصطناعي', 'data science', 'علم البيانات', 'science des données', 'cybersecurity', 'cybersécurité', 'الأمن السيبراني', 'sécurité informatique', 'أمن المعلومات', 'networks', 'réseaux', 'شبكات', 'réseaux et systèmes distribués', 'systèmes distribués', 'information systems', 'systèmes d’information', 'نظم المعلومات', 'نظم معلومات', 'développement web', 'تطوير الويب', 'base de données', 'bases de données', 'قواعد البيانات', 'robotique', 'robotics', 'روبوتيك', 'vision par ordinateur', 'apprentissage automatique', 'machine learning', 'deep learning'],
    sequence: [
      { id: 'problem', titleAr: 'المشكلة والمستخدم', purposeAr: 'تعريف الحاجة والمستفيد وسياق الاستخدام.', contentHintsAr: ['المشكلة الحالية', 'أصحاب المصلحة', 'الأهداف'], visualHintsAr: ['رحلة مستخدم أو حالة استخدام'] },
      { id: 'requirements', titleAr: 'المتطلبات ومعايير النجاح', purposeAr: 'تحديد الوظائف والجودة والأمن ومعايير القبول.', contentHintsAr: ['المتطلبات الأساسية', 'المقاييس المستهدفة'], visualHintsAr: ['قصص مستخدم أو مصفوفة متطلبات'] },
      { id: 'architecture', titleAr: 'البنية والاختيارات', purposeAr: 'توضيح بنية النظام ومسار البيانات ولماذا اختيرت الأدوات.', contentHintsAr: ['المكونات', 'مصدر البيانات', 'الخصوصية والأمان'], visualHintsAr: ['مخطط بنية/تدفق بيانات'] },
      { id: 'build', titleAr: 'التنفيذ والعرض', purposeAr: 'إظهار الوظائف التي أُنجزت فعلاً مع حالة استخدام قصيرة.', contentHintsAr: ['التقنيات الجوهرية', 'لقطة أصلية أو عرض حي آمن'], visualHintsAr: ['لقطة شاشة معلّمة أو demo قصير'] },
      { id: 'evaluation', titleAr: 'الاختبار والتقييم', purposeAr: 'شرح بروتوكول التقييم وخط الأساس والبيانات والنتائج.', contentHintsAr: ['اختبارات وظيفية/أداء/مستخدم', 'baseline', 'المقاييس'], visualHintsAr: ['جدول اختبار أو رسم مقارنة'] },
      { id: 'results', titleAr: 'النتائج والقيود', purposeAr: 'تلخيص الأداء والثغرات والحدود المعروفة.', contentHintsAr: ['نتائج موثقة', 'حالات الفشل', 'حدود التعميم'], visualHintsAr: ['لوحة مؤشرات صغيرة أو مقارنة'] },
      { id: 'conclusion', titleAr: 'الخلاصة والتطوير', purposeAr: 'تحديد ما صار ممكناً وما يلزم تطويره لاحقاً.', contentHintsAr: ['إنجازات مقابل المتطلبات', 'خطوة تالية'], visualHintsAr: ['خارطة طريق مختصرة'] },
    ],
    guardrailsAr: ['لا تعرض الكود الكامل أو كلمات المرور أو مفاتيح API.', 'في الذكاء الاصطناعي، اذكر مصدر البيانات وخط الأساس ومقياس التقييم والحدود.', 'لا تدّعِ أن النظام منشور أو قابل للتوسع دون دليل.'],
  },
  {
    id: 'business-social',
    titleAr: 'الاقتصاد والتسيير والعلوم الاجتماعية',
    summaryAr: 'للدراسات التنظيمية والاقتصادية والميدانية والاستبيانات ودراسات الحالة.',
    specialtyAliases: ['economics', 'économie', 'اقتصاد', 'économie monétaire et bancaire', 'اقتصاد نقدي ومصرفي', 'économie internationale', 'économie quantitative', 'management', 'gestion', 'تسيير', 'gestion des entreprises', 'إدارة الأعمال', 'business administration', 'business', 'commerce', 'تجارة', 'commerce international', 'تجارة دولية', 'finance', 'مالية', 'gestion financière', 'إدارة مالية', 'accounting', 'comptabilité', 'محاسبة', 'audit', 'تدقيق', 'fiscalité', 'جباية', 'taxation', 'marketing', 'تسويق', 'ressources humaines', 'موارد بشرية', 'logistique', 'لوجستيك', 'économie des hydrocarbures', 'sociology', 'sociologie', 'علم الاجتماع', 'psychology', 'psychologie', 'علم النفس', 'political science', 'sciences politiques', 'علوم سياسية', 'international relations', 'relations internationales', 'علاقات دولية', 'communication', 'اتصال', 'demography', 'démographie', 'ديموغرافيا', 'anthropology', 'anthropologie', 'أنثروبولوجيا', 'criminology', 'criminologie', 'علم الإجرام', 'public administration', 'الإدارة العامة', 'gouvernance', 'حوكمة', 'journalism', 'صحافة', 'library science', 'bibliothéconomie', 'علم المكتبات', 'social work', 'خدمة اجتماعية'],
    sequence: [
      { id: 'context', titleAr: 'السياق والمشكلة', purposeAr: 'تعريف المؤسسة أو الظاهرة والحاجة البحثية.', contentHintsAr: ['سياق الحالة', 'الفجوة العملية أو العلمية'], visualHintsAr: ['خريطة أو صورة موثقة للميدان'] },
      { id: 'framework', titleAr: 'الإطار والنموذج', purposeAr: 'اختيار المفاهيم أو المتغيرات الضرورية فقط.', contentHintsAr: ['تعريفات تشغيلية', 'نموذج أو علاقة متوقعة'], visualHintsAr: ['نموذج مفاهيمي'] },
      { id: 'method', titleAr: 'الميدان والعينة', purposeAr: 'شرح تصميم البحث والعينة والأداة والتحقق والأخلاقيات.', contentHintsAr: ['المجتمع والعينة', 'أداة الجمع', 'الفترة', 'حدود العينة'], visualHintsAr: ['مخطط العينة أو خريطة الميدان'] },
      { id: 'data', titleAr: 'تحليل المعطيات', purposeAr: 'شرح كيف عولجت البيانات للوصول إلى النتائج.', contentHintsAr: ['اختبارات/ترميز/تحليل نوعي', 'معايير المقارنة'], visualHintsAr: ['مخطط تدفق التحليل'] },
      { id: 'findings', titleAr: 'النتائج الرئيسية', purposeAr: 'إبراز ما يجيب عن السؤال لا إعادة عرض كل الجداول.', contentHintsAr: ['3–4 نتائج مدعومة', 'حجم العينة ومصدر البيانات'], visualHintsAr: ['رسم واضح أو اقتباس مجهّل'] },
      { id: 'recommendations', titleAr: 'الدلالات والتوصيات', purposeAr: 'ترجمة النتائج إلى آثار نظرية أو عملية واقعية.', contentHintsAr: ['ما الذي يمكن تغييره؟', 'من المسؤول؟'], visualHintsAr: ['خارطة أولويات أو أثر/جهد'] },
      { id: 'limits', titleAr: 'الحدود والخلاصة', purposeAr: 'تقديم حدود الدراسة وجوابها النهائي.', contentHintsAr: ['تحيزات وقيود', 'إجابة مركزة'], visualHintsAr: ['خلاصة واحدة'], optional: true },
    ],
    guardrailsAr: ['لا تعرض النسب دون المقام وحجم العينة.', 'لا تجعل عينة ملائمة تمثل مجتمعاً كاملاً.', 'أخفِ هوية المشاركين والمؤسسات إذا اقتضى اتفاق البحث ذلك.'],
  },
  {
    id: 'humanities-law',
    titleAr: 'الآداب والحقوق والعلوم الإنسانية',
    summaryAr: 'للدراسات القانونية والتاريخية واللغوية والأدبية والفلسفية والتحليلية.',
    specialtyAliases: ['law', 'droit', 'حقوق', 'قانون', 'history', 'histoire', 'تاريخ', 'philosophy', 'philosophie', 'فلسفة', 'humanities', 'علوم إنسانية', 'Islamic studies', 'études islamiques', 'علوم إسلامية', 'شريعة', 'أساسيات الدين', 'archaeology', 'archéologie', 'آثار', 'cultural studies', 'دراسات ثقافية', 'archives', 'أرشيف', 'media studies', 'علوم الإعلام', 'إعلام'],
    sequence: [
      { id: 'scope', titleAr: 'الموضوع وحدوده', purposeAr: 'تعريف الإشكال وحدوده الزمانية/المكانية/المفهومية.', contentHintsAr: ['مصطلحات أساسية', 'سؤال مركزي'], visualHintsAr: ['خط زمني أو خريطة نطاق'] },
      { id: 'sources', titleAr: 'الإطار والمصادر', purposeAr: 'تعريف النصوص أو الوثائق أو الأحكام أو corpus المعتمد ومعيار اختياره.', contentHintsAr: ['مصادر أولية/ثانوية', 'إطار قانوني أو تاريخي عند انطباقه'], visualHintsAr: ['خريطة مصادر أو خط زمني تشريعي'] },
      { id: 'method', titleAr: 'المنهج التحليلي', purposeAr: 'شرح القراءة أو المقارنة أو التحليل المعتمد.', contentHintsAr: ['منهج وأسباب اختياره', 'حدود المادة المدروسة'], visualHintsAr: ['مخطط تحليل'] },
      { id: 'argument', titleAr: 'الحجة والتحليل', purposeAr: 'تنظيم الاستدلال إلى محاور مترابطة تعرض أطروحة الباحث وأدلتها.', contentHintsAr: ['2–3 حجج كبرى', 'دليل نصي/قانوني/تاريخي لكل حجة'], visualHintsAr: ['خريطة حجة أو جدول مقارنة مصادر'] },
      { id: 'contribution', titleAr: 'الإضافة والحدود', purposeAr: 'بيان ما تضيفه القراءة أو التأويل والقيود التي تحدّ منها.', contentHintsAr: ['الإضافة العلمية', 'حدود corpus أو التفسير'], visualHintsAr: ['ملخص بصري للحجة'] },
      { id: 'conclusion', titleAr: 'الجواب والخلاصة', purposeAr: 'الإجابة عن الإشكالية وتحديد ما بقي مفتوحاً.', contentHintsAr: ['جواب مركزي', 'آفاق لاحقة'], visualHintsAr: ['عبارة ختامية مقتبسة مع مصدر أو خلاصة'] },
    ],
    guardrailsAr: ['لا تفرض قياسات أو رسوم إحصائية على بحث نوعي.', 'لا تعرض اقتباساً مطولاً؛ اعرض الدليل المختصر وفسّره.', 'في الحقوق، تحقق من رقم النص وتاريخه وحالته قبل العرض.'],
  },
  {
    id: 'education',
    titleAr: 'التربية وعلوم التعليم',
    summaryAr: 'للتعليم والتكوين وتعليمية المواد والتقويم والتدخلات التربوية.',
    specialtyAliases: ['education', 'éducation', 'تربية', 'علوم التربية', 'educational sciences', 'sciences de l’éducation', 'sociologie de l’éducation', 'psychologie de l’éducation', 'pedagogy', 'pédagogie', 'بيداغوجيا', 'didactics', 'didactique', 'تعليمية', 'teacher training', 'formation des enseignants', 'تكوين المعلمين', 'curriculum', 'curricula', 'المناهج الدراسية', 'قياس وتقويم', 'assessment', 'special education', 'تربية خاصة', 'orthophonie', 'école normale supérieure', 'مدرسة عليا للأساتذة'],
    sequence: [
      { id: 'setting', titleAr: 'السياق التربوي', purposeAr: 'وصف المستوى أو القسم أو المؤسسة والمشكلة التعليمية.', contentHintsAr: ['السياق التعليمي', 'الملاحظة أو الفجوة'], visualHintsAr: ['مخطط بيئة التعلم دون تعريف طلاب'] },
      { id: 'framework', titleAr: 'الإطار والأسئلة', purposeAr: 'تحديد المفاهيم والهدف والسؤال/الفرضية.', contentHintsAr: ['مفاهيم تعليمية', 'هدف الدراسة'], visualHintsAr: ['نموذج تعلم مبسط'] },
      { id: 'method', titleAr: 'التصميم والعينة', purposeAr: 'شرح التصميم والأدوات والمشاركين والموافقات.', contentHintsAr: ['نوع البحث', 'المشاركون', 'الأداة', 'الموافقة وحماية القاصرين'], visualHintsAr: ['مخطط مراحل جمع البيانات'] },
      { id: 'intervention', titleAr: 'التدخل أو الإجراء', purposeAr: 'عرض النشاط التعليمي أو الإجراء المرصود إذا كان جزءاً من البحث.', contentHintsAr: ['خطوات التدخل', 'المدة والمواد'], visualHintsAr: ['تسلسل درس أو مخطط نشاط'], optional: true },
      { id: 'findings', titleAr: 'النتائج والتفسير', purposeAr: 'ربط النتائج بأسئلة الدراسة والسياق التربوي.', contentHintsAr: ['أدلة من أدوات البحث', 'تغيرات مرصودة دون مبالغة'], visualHintsAr: ['رسم أو مقتطف مجهّل'] },
      { id: 'implications', titleAr: 'الأثر والتوصيات', purposeAr: 'صياغة توصيات عملية واقعية للمعلمين أو البرامج.', contentHintsAr: ['ما الذي تدعمه النتائج؟', 'الحدود'], visualHintsAr: ['مصفوفة توصية/مسؤول/شرط'] },
      { id: 'conclusion', titleAr: 'الخلاصة والآفاق', purposeAr: 'إجابة السؤال وتحديد ما ينبغي اختباره لاحقاً.', contentHintsAr: ['جواب', 'بحث مستقبلي'], visualHintsAr: ['خلاصة واحدة'] },
    ],
    guardrailsAr: ['أخفِ بيانات التلاميذ والقاصرين والمدارس عند الحاجة.', 'ميّز بين الملاحظة والسببية، وبين تحسن مُقاس وانطباع شخصي.'],
  },
  {
    id: 'architecture-design',
    titleAr: 'العمارة والتصميم والفنون',
    summaryAr: 'للمشاريع المعمارية والعمرانية والتصميمية والفنية التي يكون المنتج البصري فيها محور العمل.',
    specialtyAliases: ['architecture', 'عمارة', 'architecte', 'urbanisme', 'تعمير', 'urban planning', 'design', 'تصميم', 'aménagement du territoire', 'تهيئة عمرانية', 'gestion urbaine', 'إدارة حضرية', 'architecture intérieure', 'عمارة داخلية', 'paysage', 'landscape architecture', 'عمارة المناظر الطبيعية'],
    sequence: [
      { id: 'brief', titleAr: 'الموقع والبرنامج', purposeAr: 'تعريف السياق والمستخدمين والبرنامج والقيود.', contentHintsAr: ['موقع ومحيط', 'متطلبات ومساحة', 'شروط الوصول/السلامة'], visualHintsAr: ['خريطة موقع وصور ميدانية'] },
      { id: 'research', titleAr: 'المراجع ومعايير التصميم', purposeAr: 'تحديد مراجع ومبادئ التصميم وكيف أثرت في الحل.', contentHintsAr: ['مراجع مختارة', 'معايير أو سوابق'], visualHintsAr: ['لوحة مرجعية منتقاة لا collage زخرفي'] },
      { id: 'concept', titleAr: 'الفكرة والتطور', purposeAr: 'توضيح الفكرة والبدائل والقرارات التصميمية.', contentHintsAr: ['بدائل أولية', 'سبب اعتماد البديل'], visualHintsAr: ['مخطط تطور أو diagram مفاهيمي'] },
      { id: 'proposal', titleAr: 'المشروع النهائي', purposeAr: 'عرض المنتج النهائي بقراءة من العام إلى التفصيل.', contentHintsAr: ['المخططات والواجهات/المقاطع', 'العلاقة بالموقع'], visualHintsAr: ['مخطط رئيسي معلّم، مقطع، منظور'] },
      { id: 'resolution', titleAr: 'الحل التقني والتشغيلي', purposeAr: 'إظهار كيف يعمل المشروع والمواد أو الأنظمة الأساسية.', contentHintsAr: ['مواد أو إنشائيات', 'حركة المستخدم', 'استدامة أو وصول إن كانت ضمن المشروع'], visualHintsAr: ['تفصيل مكبّر أو مخطط تشغيلي'] },
      { id: 'critique', titleAr: 'التقييم والحدود', purposeAr: 'تقييم الحل مقابل البرنامج والسياق مع الاعتراف بما بقي.', contentHintsAr: ['تحقق المتطلبات', 'حدود أو مفاضلات'], visualHintsAr: ['مصفوفة متطلبات أو مقارنة البدائل'] },
      { id: 'conclusion', titleAr: 'الخلاصة والأسئلة', purposeAr: 'تلخيص أطروحة المشروع وفتح النقاش.', contentHintsAr: ['رسالة تصميمية', 'خطوة تالية'], visualHintsAr: ['صورة ختامية واحدة'] },
    ],
    guardrailsAr: ['لا تستبدل المخططات المقروءة بصور تجميلية.', 'أظهر مقياس الرسم والاتجاه والوسوم الأساسية.', 'لا تنسب مخططاً أو صورة مرجعية إلى الطالب إن لم تكن من إنتاجه.'],
  },
  {
    id: 'vocational-project',
    titleAr: 'مشروع مهني أو مذكرة تربص',
    summaryAr: 'للأعمال التطبيقية في معاهد ومراكز التكوين والتربصات المهنية، عند غياب دليل مؤسسي أدق.',
    specialtyAliases: ['vocational training', 'formation professionnelle', 'تكوين مهني', 'معهد التكوين', 'technical institute', 'technicien', 'تقني سامي', 'internship report', 'rapport de stage', 'تربص', 'مشروع نهاية التكوين'],
    sequence: [
      { id: 'organization', titleAr: 'المؤسسة والمهمة', purposeAr: 'تعريف مكان التربص والدور والمشكلة العملية دون كشف معلومات سرية.', contentHintsAr: ['المصلحة/الورشة', 'هدف المهمة'], visualHintsAr: ['خريطة تنظيمية مبسطة أو صورة مسموحة'] },
      { id: 'requirements', titleAr: 'المتطلبات والسلامة', purposeAr: 'عرض المواصفات وقواعد السلامة والأدوات اللازمة.', contentHintsAr: ['معايير العمل', 'معدات الوقاية', 'قيود المكان'], visualHintsAr: ['قائمة تحقق أو مخطط معدات'] },
      { id: 'workflow', titleAr: 'خطوات الإنجاز', purposeAr: 'شرح سير العمل العملي وما نفذه المتدرب.', contentHintsAr: ['تتابع العمل', 'نقاط القرار'], visualHintsAr: ['مخطط تدفق أو صور مراحل'] },
      { id: 'quality', titleAr: 'الفحص وجودة التنفيذ', purposeAr: 'إظهار كيف تم التحقق من صحة العمل.', contentHintsAr: ['اختبارات أو قياسات', 'معايير الجودة'], visualHintsAr: ['قائمة فحص أو مقارنة قبل/بعد'] },
      { id: 'outcome', titleAr: 'النتيجة والدروس', purposeAr: 'تقديم النتيجة العملية وما تعلمه المتدرب.', contentHintsAr: ['مخرجات قابلة للتحقق', 'مشكلة وكيف عولجت'], visualHintsAr: ['صور/قياسات موثقة'] },
      { id: 'recommendations', titleAr: 'التوصيات والخلاصة', purposeAr: 'توصيات مناسبة للمؤسسة أو التدريب وخلاصة المهارات.', contentHintsAr: ['تحسين ممكن', 'مهارات مكتسبة'], visualHintsAr: ['قائمة قصيرة مرتبطة بالمشكلة'] },
    ],
    guardrailsAr: ['اسأل عن نموذج المعهد ومدّة العرض؛ لا تفترض أن قواعد الجامعة تنطبق على مركز التكوين.', 'لا تكشف أسرار المؤسسة أو بيانات الزبائن.', 'افصل بين ما شاهده المتربص وما نفذه بنفسه.'],
  },
  {
    id: 'mathematics-statistics',
    titleAr: 'الرياضيات والإحصاء والبحوث الكمية',
    summaryAr: 'للبرهان والنمذجة الرياضية والإحصاء وبحوث العمليات والتحليل العددي.',
    specialtyAliases: ['mathematics', 'mathématiques', 'رياضيات', 'رياضيات تطبيقية', 'mathematics and statistics', 'إحصاء', 'statistique', 'statistics', 'probabilités', 'احتمالات', 'recherche opérationnelle', 'بحوث العمليات', 'analyse numérique', 'تحليل عددي', 'algèbre', 'جبر', 'تحليل', 'optimization', 'optimisation', 'تحسين', 'actuariat', 'actuarial science', 'معادلات تفاضلية', 'équations différentielles'],
    sequence: [
      { id: 'question', titleAr: 'السؤال والبنية الرياضية', purposeAr: 'صياغة المسألة وتعريف الرموز والافتراضات اللازمة.', contentHintsAr: ['المسألة المحددة', 'الفرضيات والشروط'], visualHintsAr: ['رسم المسألة أو مخطط المتغيرات'] },
      { id: 'background', titleAr: 'التعريفات والنتائج السابقة', purposeAr: 'عرض المفاهيم والنظريات السابقة التي يعتمد عليها البرهان أو النموذج.', contentHintsAr: ['تعريفات قصيرة', 'نتائج لازمة فقط'], visualHintsAr: ['خريطة علاقات بين النتائج'], optional: true },
      { id: 'method', titleAr: 'المنهج والاشتقاق', purposeAr: 'شرح البرهان أو الخوارزمية أو بناء النموذج خطوة بخطوة.', contentHintsAr: ['المبرهنة/الفكرة المركزية', 'خطوات الاشتقاق', 'شروط الصحة'], visualHintsAr: ['مسار برهان أو pseudo-code مختصر'] },
      { id: 'example', titleAr: 'مثال أو تجربة عددية', purposeAr: 'توضيح النتيجة بمثال أو محاكاة تحقق، عندما يحتوي العمل عليها.', contentHintsAr: ['المعطيات', 'المقارنة أو الخطأ العددي'], visualHintsAr: ['رسم دالة أو جدول نتائج'], optional: true },
      { id: 'result', titleAr: 'النتيجة والتحقق', purposeAr: 'عرض النتيجة الرئيسة وإثباتها أو التحقق العددي منها.', contentHintsAr: ['مبرهنة/نتيجة', 'حدود التحقق'], visualHintsAr: ['صيغة أساسية أو رسم تقارب'] },
      { id: 'contribution', titleAr: 'الإضافة والحدود', purposeAr: 'تمييز الإضافة عن النتائج المعروفة وذكر شروط صلاحيتها.', contentHintsAr: ['ما الجديد؟', 'ما الشروط التي لا يغطيها؟'], visualHintsAr: ['مقارنة مختصرة بمرجع أو baseline'] },
      { id: 'conclusion', titleAr: 'الخلاصة والامتداد', purposeAr: 'تلخيص النتيجة وفتح مسألة لاحقة منطقية.', contentHintsAr: ['جواب المسألة', 'امتداد ممكن'], visualHintsAr: ['رسالة رياضية واحدة'] },
    ],
    guardrailsAr: ['لا تعرض معادلات بلا تعريف الرموز أو تفسير الحدس.', 'لا تسمِّ نتيجة عدداً إحصائياً أو دلالةً من دون شرط الاختبار وحجم البيانات.', 'ميّز البرهان النظري من التجربة العددية.'],
  },
  {
    id: 'earth-universe-sciences',
    titleAr: 'علوم الأرض والكون والجغرافيا المكانية',
    summaryAr: 'لعلوم الأرض والجيولوجيا والجيوفيزياء والجغرافيا والموارد والمياه والفضاء.',
    specialtyAliases: ['sciences de la terre', 'علوم الأرض', 'sciences de l’univers', 'علوم الكون', 'geology', 'géologie', 'جيولوجيا', 'geophysics', 'géophysique', 'جيوفيزياء', 'geography', 'géographie', 'جغرافيا', 'geomatics', 'géomatique', 'جيوماتيك', 'hydrogeology', 'hydrogéologie', 'هيدروجيولوجيا', 'hydrology', 'hydrologie', 'هيدرولوجيا', 'oceanography', 'océanographie', 'علوم المحيطات', 'astronomy', 'astronomie', 'فلك', 'cartography', 'cartographie', 'خرائط', 'remote sensing', 'télédétection', 'استشعار عن بعد', 'seismology', 'sismologie', 'علم الزلازل', 'geodesy', 'جيوديسيا', 'mineral resources', 'ressources minérales', 'موارد معدنية'],
    sequence: [
      { id: 'area', titleAr: 'المجال وموقع الدراسة', purposeAr: 'تحديد المنطقة أو الوسط ونطاق الزمان/المكان.', contentHintsAr: ['حدود الموقع', 'سبب اختياره', 'فترة الرصد'], visualHintsAr: ['خريطة شمالية الاتجاه ومقياس/إحداثيات'] },
      { id: 'question', titleAr: 'السؤال والبيانات', purposeAr: 'ربط السؤال بنوع البيانات أو الظاهرة المرصودة.', contentHintsAr: ['فرضية/هدف', 'محطات أو طبقات البيانات', 'مصدر البيانات'], visualHintsAr: ['خريطة عينات أو مقطع جيولوجي'] },
      { id: 'methods', titleAr: 'المسح والتحليل', purposeAr: 'شرح القياس الميداني أو المختبري أو الجغرافي المكاني.', contentHintsAr: ['الأجهزة/المقياس', 'المعالجة أو النموذج', 'دقة البيانات'], visualHintsAr: ['مخطط عمل GIS أو سير أخذ العينات'] },
      { id: 'validation', titleAr: 'التحقق من النموذج', purposeAr: 'بيان المعايرة أو المقارنة الميدانية أو عدم اليقين إن وجد.', contentHintsAr: ['بيانات تحقق مستقلة', 'حدود الدقة'], visualHintsAr: ['خريطة خطأ أو مقطع مقارنة'] },
      { id: 'findings', titleAr: 'النتائج المكانية', purposeAr: 'عرض النمط أو التصنيف أو العلاقة المكانية الأهم.', contentHintsAr: ['نتيجة مرتبطة بالهدف', 'وحدات ومفتاح واضح'], visualHintsAr: ['خريطة موضوعية مقروءة أو مقطع/رسم'] },
      { id: 'interpretation', titleAr: 'التفسير والقيود', purposeAr: 'تفسير النتائج وفق العمليات الجيولوجية/المكانية وبيان القيود.', contentHintsAr: ['تفسير مدعوم', 'مقياس التعميم', 'قيود الرصد'], visualHintsAr: ['مخطط سببي مشروط أو مقارنة مواقع'] },
      { id: 'conclusion', titleAr: 'الخلاصة والتطبيق', purposeAr: 'تلخيص النتيجة ودلالتها لإدارة الموارد/المخاطر عند ثبوتها.', contentHintsAr: ['جواب السؤال', 'توصية وحدودها'], visualHintsAr: ['خريطة/استنتاج واحد'] },
    ],
    guardrailsAr: ['لا تخفِ نظام الإحداثيات أو مقياس الرسم أو مصدر الخريطة.', 'ميّز القياس المباشر عن ناتج الاستشعار عن بعد أو النموذج.', 'لا تعمم مكانياً خارج نطاق العينات والتحقق.'],
  },
  {
    id: 'sports-sciences',
    titleAr: 'علوم الرياضة والنشاط البدني',
    summaryAr: 'لعلوم وتقنيات الأنشطة البدنية والرياضية والتدريب والأداء الحركي.',
    specialtyAliases: ['staps', 'sciences du sport', 'sport sciences', 'علوم الرياضة', 'علوم وتقنيات النشاطات البدنية والرياضية', 'activité physique', 'activité physique adaptée', 'نشاط بدني', 'entraînement sportif', 'تدريب رياضي', 'sport training', 'éducation physique', 'تربية بدنية', 'physiologie de l’exercice', 'فسيولوجيا الجهد', 'performance sportive', 'أداء رياضي', 'management du sport', 'إدارة رياضية'],
    sequence: [
      { id: 'question', titleAr: 'سؤال الأداء أو الحركة', purposeAr: 'تحديد الظاهرة أو الأداء والسياق الرياضي.', contentHintsAr: ['الهدف', 'المتغيرات الأساسية'], visualHintsAr: ['مخطط نموذج أداء/حركة'] },
      { id: 'participants', titleAr: 'المشاركون والبروتوكول', purposeAr: 'وصف العينة والتجنيد والموافقة وإجراءات السلامة.', contentHintsAr: ['خصائص العينة دون معرّفات', 'الموافقة', 'معايير الإدراج'], visualHintsAr: ['مخطط اختيار المشاركين'] },
      { id: 'measurement', titleAr: 'التدخل والقياس', purposeAr: 'عرض برنامج التدريب أو الاختبار وأدوات القياس.', contentHintsAr: ['المدة والشدة/التكرار', 'المقاييس والأجهزة'], visualHintsAr: ['خط زمني للتدخل أو تسلسل الاختبار'] },
      { id: 'results', titleAr: 'النتائج الحركية', purposeAr: 'مقارنة النتائج وفق التصميم مع إظهار المقامات والتباين.', contentHintsAr: ['النتائج الأساسية', 'خط أساس/مقارنة', 'عدم اليقين'], visualHintsAr: ['رسم قبل/بعد أو منحنى أداء'] },
      { id: 'discussion', titleAr: 'التفسير والسلامة', purposeAr: 'تفسير الأثر وحدود القياس والتطبيق التدريبي.', contentHintsAr: ['الأهمية العملية', 'الآثار غير المقصودة', 'القيود'], visualHintsAr: ['مقارنة بالدراسات ذات الصلة'] },
      { id: 'conclusion', titleAr: 'الخلاصة والتوصيات', purposeAr: 'إجابة السؤال وتحديد ما يمكن تطبيقه أو اختباره تالياً.', contentHintsAr: ['خلاصة مدعومة', 'اقتراح تالٍ'], visualHintsAr: ['رسالة تدريبية قصيرة'] },
    ],
    guardrailsAr: ['لا تستخدم صوراً تكشف هوية المشاركين دون إذن.', 'لا تعمم تحسناً على مجتمع أوسع من العينة.', 'افصل بين الأهمية الإحصائية والأهمية العملية.'],
  },
  {
    id: 'language-literature',
    titleAr: 'اللغة والأدب واللسانيات والترجمة',
    summaryAr: 'للغة العربية والأمازيغية واللغات الأجنبية واللسانيات والأدب والترجمة وتعليم اللغات.',
    specialtyAliases: ['lettres et langues', 'langues étrangères', 'langues etrangeres', 'آداب ولغات', 'langue et littérature arabes', 'لغة وأدب عربي', 'اللغة العربية وآدابها', 'langue et culture amazighes', 'لغة وثقافة أمازيغية', 'amazigh', 'tamazight', 'تمازيغت', 'linguistics', 'linguistique', 'لسانيات', 'applied linguistics', 'لسانيات تطبيقية', 'literature', 'littérature', 'أدب', 'traduction', 'translation', 'ترجمة', 'didactique des langues', 'تعليمية اللغات', 'phonétique', 'phonology', 'صوتيات', 'sémantique', 'دلالة', 'civilisation', 'حضارة'],
    sequence: [
      { id: 'corpus', titleAr: 'المتن وسؤال البحث', purposeAr: 'تعريف الظاهرة اللغوية أو الأدبية والمتن وحدوده.', contentHintsAr: ['سؤال واضح', 'مصدر النصوص/التسجيلات', 'حدود زمنية/لغوية'], visualHintsAr: ['خريطة المتن أو خط زمني'] },
      { id: 'framework', titleAr: 'المفاهيم والمنهج', purposeAr: 'تحديد المفاهيم والنظرية/المنهج التحليلي الضروري.', contentHintsAr: ['مفاهيم تشغيلية', 'معيار اختيار النظرية'], visualHintsAr: ['شبكة مفاهيم أو نموذج لغوي'] },
      { id: 'method', titleAr: 'إجراءات التحليل', purposeAr: 'شرح أخذ العينات والترميز والتحليل أو خطوات الترجمة.', contentHintsAr: ['وحدة التحليل', 'أداة أو معيار الترميز', 'التحقق'], visualHintsAr: ['مخطط تحليل مقطع'] },
      { id: 'evidence', titleAr: 'الشواهد والنتائج', purposeAr: 'عرض الشواهد التي تحمل الاستنتاج مع تفسيرها.', contentHintsAr: ['شواهد قصيرة', 'سياقها', 'ترجمة دقيقة عند الحاجة'], visualHintsAr: ['مقتطف مشروح أو جدول لغوي/ترجمي'] },
      { id: 'argument', titleAr: 'الحجة والمناقشة', purposeAr: 'تنظيم النتائج في محاور تجيب عن السؤال وتوضح الإضافة.', contentHintsAr: ['محوران أو ثلاثة', 'مقارنة بالدراسات'], visualHintsAr: ['خريطة حجة'] },
      { id: 'conclusion', titleAr: 'الخلاصة والامتداد', purposeAr: 'صياغة الجواب وحدود المتن وآفاق البحث.', contentHintsAr: ['استنتاج محدد', 'مصادر/لهجات/متون لاحقة'], visualHintsAr: ['ملخص بصري موجز'] },
    ],
    guardrailsAr: ['في الأمازيغية، صرّح بالتنوع اللغوي وطريقة النسخ والترجمة ولا توحّد اللهجات بلا سند.', 'لا تعرض شواهد طويلة غير مقروءة؛ اقتبس الجزء اللازم وفسّره.', 'ميّز بين وصف الظاهرة وتأويلها.'],
  },
  {
    id: 'arts-creative',
    titleAr: 'الفنون والممارسة الإبداعية',
    summaryAr: 'للفنون البصرية والموسيقى والمسرح والسينما والتصميم الغرافيكي والمشاريع الإبداعية.',
    specialtyAliases: ['arts', 'arts plastiques', 'فنون', 'فنون تشكيلية', 'الفنون الجميلة', 'arts visuels', 'arts visuels', 'الفنون البصرية', 'graphic design', 'design graphique', 'تصميم غرافيكي', 'cinéma', 'cinema', 'سينما', 'photographie', 'photography', 'تصوير فوتوغرافي', 'musique', 'music', 'موسيقى', 'théâtre', 'theatre', 'مسرح', 'scénographie', 'سينوغرافيا', 'création artistique', 'إبداع فني'],
    sequence: [
      { id: 'intent', titleAr: 'السؤال والنية الفنية', purposeAr: 'تعريف سؤال المشروع أو الفكرة والوسيط والجمهور المقصود.', contentHintsAr: ['نية/رسالة العمل', 'سياق العرض'], visualHintsAr: ['صورة/مقطع تمهيدي من العمل'] },
      { id: 'references', titleAr: 'المراجع والسياق', purposeAr: 'عرض المرجعيات الفنية والثقافية المرتبطة بالقرارات.', contentHintsAr: ['سوابق مختارة', 'مفاهيم أساسية'], visualHintsAr: ['لوحة مراجع منسوبة لمصادرها'] },
      { id: 'process', titleAr: 'مسار الإنتاج', purposeAr: 'إظهار التجريب والاختيارات والتعديلات من الفكرة إلى النسخة النهائية.', contentHintsAr: ['اسكتشات/نماذج', 'مواد وتقنيات', 'قرارات وتغييرات'], visualHintsAr: ['تسلسل مراحل أصلي'] },
      { id: 'artifact', titleAr: 'العمل النهائي', purposeAr: 'عرض العمل أو أجزاء منه مع تهيئة مشاهدة/استماع مناسبة.', contentHintsAr: ['العمل المنجز', 'الوسيط والمدة/الأبعاد'], visualHintsAr: ['صورة عالية الجودة أو مقطع قصير/عينة صوت'] },
      { id: 'critique', titleAr: 'القراءة والتقييم', purposeAr: 'شرح كيف يحقق العمل قصده وتلقيه وحدود تنفيذه.', contentHintsAr: ['معيار نقد/تقييم', 'ردود فعل موثقة إن وجدت'], visualHintsAr: ['تفصيل مكبّر أو مقارنة دراسة/نتيجة'] },
      { id: 'conclusion', titleAr: 'الخلاصة والآفاق', purposeAr: 'صياغة ما تعلمه المشروع وما يمكن تطويره.', contentHintsAr: ['إضافة العمل', 'تطوير لاحق'], visualHintsAr: ['إطار ختامي من العمل'] },
    ],
    guardrailsAr: ['احفظ نسب العمل والمواد المرجعية والموسيقى والصور لأصحابها.', 'لا تختزل التقييم الفني إلى أرقام غير مبررة.', 'جهّز الوسائط لتعمل دون اتصال وتجنّب مقاطع طويلة على حساب الشرح.'],
  },
] as const satisfies readonly ThesisMethodology[];

export function getThesisMethodology(id: ThesisMethodologyId): ThesisMethodology {
  return THESIS_METHODOLOGIES.find((methodology) => methodology.id === id) ?? THESIS_METHODOLOGIES[0];
}
