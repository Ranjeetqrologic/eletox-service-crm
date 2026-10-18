// Default homepage content; admin-saved Company.siteContent overrides these (per field).
const A = "/eletox-assets";

export type SiteContent = {
  servicesSub: string; servicesTitle: string;
  servicesBoxImage: string; servicesBoxBadge: string; servicesBoxSub: string; servicesBoxTitle: string; servicesBoxPoints: string[];
  aboutSub: string; aboutTitle: string; aboutText: string; aboutImage1: string; aboutImage2: string;
  aboutYears: string; aboutYearsText: string; aboutBadgeTitle: string; aboutBadgeSub: string;
  aboutFeatures: { t: string; d: string }[];
  facts: { value: string; l1: string; l2: string; icon: string }[];
  estimateSub: string; estimateTitle: string; estimateText: string; estimateImage: string; estimateImageTitle: string; estimateImageSub: string; estimateBadge: string;
  formTitle: string; formText: string;
  teamSub: string; teamTitle: string; team: { name: string; role: string; image: string }[];
  whySub: string; whyTitle: string; whyText: string; whyImage: string; whyBadgeTitle: string; whyBadgeSub: string;
  whyChoose: { title: string; desc: string }[];
  blogSub: string; blogTitle: string; blogs: { image: string; cat: string; title: string; link?: string }[]; showBlog: boolean;
  ctaTitle: string;
  footerText: string; workingHours: string;
};

export const SITE_DEFAULTS: SiteContent = {
  servicesSub: "Featured Services", servicesTitle: "Popular repair services",
  servicesBoxImage: `${A}/icon-service.jpg`, servicesBoxBadge: "10+ Years Experience", servicesBoxSub: "Why Eletox",
  servicesBoxTitle: "Expert repair for every appliance, right at your doorstep",
  servicesBoxPoints: ["Certified technicians", "Same-day service", "Genuine spare parts", "Transparent pricing"],
  aboutSub: "About Eletox", aboutTitle: "Jaipur's trusted AC & appliance repair experts",
  aboutText: "Eletox has been keeping Jaipur homes and businesses comfortable for over a decade. Our certified technicians repair, install and service air conditioners, washing machines, geysers, microwaves, water purifiers and complete electrical systems — with genuine spare parts, upfront pricing and a service warranty on every job.",
  aboutImage1: `${A}/about-1.jpg`, aboutImage2: `${A}/about-2.jpg`,
  aboutYears: "10+", aboutYearsText: "Years of Trusted Service in Jaipur", aboutBadgeTitle: "1000+ Repairs Done", aboutBadgeSub: "Rated 4.8/5 by happy customers",
  aboutFeatures: [
    { t: "Certified Technicians", d: "Trained, background-verified professionals in Eletox uniform." },
    { t: "Same-Day Doorstep Service", d: "Book before noon and we reach you the same day, 24x7 support." },
    { t: "Transparent Pricing", d: "Fixed rate card, 18% GST — no hidden charges, quote before work." },
    { t: "Genuine Parts & Warranty", d: "Original spares with service warranty for complete peace of mind." },
  ],
  facts: [
    { value: "15", l1: "Member", l2: "Professional", icon: `${A}/icon-fact-1.png` },
    { value: "1000+", l1: "Project", l2: "Completed", icon: `${A}/icon-fact-2.png` },
    { value: "02", l1: "Total", l2: "Branches", icon: `${A}/icon-fact-3.png` },
    { value: "5000+", l1: "Client", l2: "Satisfaction", icon: `${A}/icon-fact-4.png` },
  ],
  estimateSub: "Contact Us", estimateTitle: "Book a free visit — we'll call you back",
  estimateText: "Tell us what needs fixing and our team will confirm your appointment within minutes. Same-day doorstep service across Jaipur.",
  estimateImage: `${A}/service-washing-machine-repair.jpg`, estimateImageTitle: "Eletox Expert Team", estimateImageSub: "Certified & background-verified technicians", estimateBadge: "24x7 Support",
  formTitle: "Free Estimate", formText: "Fill the form — our team will call you back shortly.",
  teamSub: "Technician Team", teamTitle: "Our dedicated & expert team member",
  team: [
    { name: "AC Service Experts", role: "Split • Window • Cassette", image: `${A}/team-1.jpg` },
    { name: "Senior Technicians", role: "10+ Years Experience", image: `${A}/team-2.jpg` },
    { name: "Appliance Specialists", role: "Washing Machine • Geyser • RO", image: `${A}/team-3.jpg` },
    { name: "Support Team", role: "24x7 Customer Care", image: `${A}/team-4.jpg` },
  ],
  whySub: "Why Choose Us", whyTitle: "Reliable repairs for better living",
  whyText: "Eletox combines skilled technicians, genuine parts and honest pricing so every repair lasts longer and every customer stays cool.",
  whyImage: `${A}/choose-bg.jpg`, whyBadgeTitle: "100% Genuine", whyBadgeSub: "Spare parts & service warranty",
  whyChoose: [
    { title: "Expert Technicians", desc: "Certified and experienced technicians who diagnose the problem right the first time and repair it with genuine parts." },
    { title: "Same-Day Service", desc: "Book in the morning, get it fixed by evening. Fast doorstep visits across Jaipur, 24x7 support." },
    { title: "Transparent Pricing", desc: "Upfront estimates with no hidden charges. Pay only for what is repaired." },
    { title: "Service Warranty", desc: "Every repair is backed by a service warranty — that is why 5000+ clients in Jaipur trust Eletox." },
  ],
  blogSub: "Recent Blogs", blogTitle: "Every single update story from our journal", showBlog: true,
  blogs: [
    { image: `${A}/blog-1.jpg`, cat: "AC Care", title: "How often should you service your AC in Jaipur summers?" },
    { image: `${A}/blog-2.jpg`, cat: "Appliances", title: "5 signs your washing machine needs a technician" },
    { image: `${A}/blog-3.jpg`, cat: "Water Purifier", title: "When to change RO filters for safe drinking water" },
  ],
  ctaTitle: "Need a repair today? Let's get started.",
  footerText: "Jaipur's trusted AC, appliance and electrical repair company. 24x7 support, same-day doorstep visit and transparent pricing.",
  workingHours: "Open 24x7 — All days",
};

export const mergeSite = (saved?: Partial<SiteContent> | null): SiteContent => {
  const out: any = { ...SITE_DEFAULTS };
  if (!saved) return out;
  for (const k of Object.keys(SITE_DEFAULTS) as (keyof SiteContent)[]) {
    const v = (saved as any)[k];
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
};
