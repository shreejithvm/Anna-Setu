import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Menu, X, Sun, Moon, MapPin, ArrowRight, Plus, Bell,
  ClipboardList, LayoutGrid, User, ChevronDown, UtensilsCrossed,
  Apple, Croissant, Milk, Wheat, Package, Search, Sparkles,HelpCircle 
} from "lucide-react";

/* ---------------------------------------------------------
   Static data
--------------------------------------------------------- */
const CATEGORIES = ["Cooked Meals", "Fruits & Vegetables", "Bakery", "Dairy", "Grains & Staples", "Packaged Food"];
const DISTRICTS = ["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki",
  "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"];

const CATEGORY_ICON = {
  "Cooked Meals": UtensilsCrossed,
  "Fruits & Vegetables": Apple,
  "Bakery": Croissant,
  "Dairy": Milk,
  "Grains & Staples": Wheat,
  "Packaged Food": Package,
};

const LISTINGS = [
  { id: 1, seller: "Devi's Kitchen", initial: "D", category: "Cooked Meals", district: "Ernakulam", price: 60, unit: "per plate" },
  { id: 2, seller: "Green Basket Farms", initial: "G", category: "Fruits & Vegetables", district: "Thrissur", price: 25, unit: "per kg" },
  { id: 3, seller: "Malabar Bakes", initial: "M", category: "Bakery", district: "Kozhikode", price: 40, unit: "per box" },
  { id: 4, seller: "Amma's Dairy", initial: "A", category: "Dairy", district: "Kottayam", price: 35, unit: "per litre" },
  { id: 5, seller: "Kannur Grain Co-op", initial: "K", category: "Grains & Staples", district: "Kannur", price: 45, unit: "per kg" },
  { id: 6, seller: "Sunrise Tiffin Center", initial: "S", category: "Cooked Meals", district: "Thiruvananthapuram", price: 50, unit: "per box" },
  { id: 7, seller: "Wayanad Organics", initial: "W", category: "Fruits & Vegetables", district: "Wayanad", price: 30, unit: "per kg" },
  { id: 8, seller: "Coastal Bites", initial: "C", category: "Packaged Food", district: "Alappuzha", price: 55, unit: "per pack" },
  { id: 9, seller: "Idukki Hill Produce", initial: "I", category: "Fruits & Vegetables", district: "Idukki", price: 28, unit: "per kg" },
  { id: 10, seller: "Palakkad Rice Mill", initial: "P", category: "Grains & Staples", district: "Palakkad", price: 38, unit: "per kg" },
  { id: 11, seller: "Kollam Curry House", initial: "K", category: "Cooked Meals", district: "Kollam", price: 65, unit: "per plate" },
  { id: 12, seller: "Kasaragod Bakers", initial: "K", category: "Bakery", district: "Kasaragod", price: 42, unit: "per box" },
];

const STATS = [
  { target: 2400, suffix: "+", label: "Meals bridged" },
  { target: 340, suffix: "", label: "Active sellers" },
  { target: 14, suffix: "", label: "Districts covered" },
];

const FAQS = [
  {
    q: "How does Anna Setu decide what's actually 'surplus'?",
    a: "Sellers list only what they'd otherwise waste that day extra plates from a lunch service, produce that won't keep till tomorrow, or a bakery's end-of-day stock. You always see the category, quantity, and price before you commit to anything.",
  },
  {
    q: "Is the food safe to eat?",
    a: "Every seller on Anna Setu is verified before their first listing goes live, and cooked meals are expected to be listed within a safe window of preparation. Look for the 'Verified seller' tag on any card before you order.",
  },
  {
    q: "How do I pick up an order?",
    a: "Pickup details and timing are arranged directly with the seller once you place an order — most listings are hyperlocal, so you're typically collecting from a kitchen or stall within your own district.",
  },
  {
    q: "Can I list food if I'm not a registered business?",
    a: "Yes. Home cooks, small farms, and individual sellers can list alongside restaurants and bakeries — tap 'Sell' and we'll walk you through a quick verification step first.",
  },
  {
    q: "What happens if a listing runs out before I order?",
    a: "Listings are removed the moment a seller marks them as sold out, so what you see in the grid is what's actually still available. No stale listings, no wasted trips.",
  },
  {
    q: "Which districts is Anna Setu live in?",
    a: "We currently operate across all 14 districts of Kerala, from Kasaragod to Thiruvananthapuram use the district filter above the listings to narrow things down to your own.",
  },
];


/* ---------------------------------------------------------
   Small hooks
--------------------------------------------------------- */
function useCountUp(target, duration = 1400, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return value;
}

function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, [options]);
  return [ref, inView];
}

/* ---------------------------------------------------------
   Presentational pieces
--------------------------------------------------------- */
function StatBlock({ stat, start, dark }) {
  const val = useCountUp(stat.target, 1400, start);
  return (
    <div>
      <b className={`block font-display text-2xl md:text-3xl ${dark ? "text-orange-400" : "text-orange-700"}`}>
        {val.toLocaleString()}{stat.suffix}
      </b>
      <span className={`text-xs font-semibold ${dark ? "text-stone-400" : "text-stone-500"}`}>{stat.label}</span>
    </div>
  );
}

function SkeletonCard({ dark }) {
  return (
    <div className={`rounded-3xl border overflow-hidden ${dark ? "border-stone-800 bg-stone-900" : "border-orange-100 bg-white"}`}>
      <div className={`h-36 bg-gradient-to-r bg-[length:400%_100%] animate-pulse ${dark ? "from-stone-800 via-stone-700 to-stone-800" : "from-orange-50 via-orange-100 to-orange-50"}`} />
      <div className="p-4 space-y-3">
        <div className={`h-3 w-2/3 rounded-full animate-pulse ${dark ? "bg-stone-800" : "bg-orange-50"}`} />
        <div className={`h-3 w-1/3 rounded-full animate-pulse ${dark ? "bg-stone-800" : "bg-orange-50"}`} />
        <div className={`h-8 w-full rounded-full animate-pulse mt-4 ${dark ? "bg-stone-800" : "bg-orange-50"}`} />
      </div>
    </div>
  );
}

function ListingCard({ item, index, onDetails, dark }) {
  const Icon = CATEGORY_ICON[item.category] || Package;
  const [ref, inView] = useInView({ threshold: 0.15 });
  return (
    <article
      ref={ref}
      style={{ transitionDelay: inView ? `${(index % 8) * 60}ms` : "0ms" }}
      className={`group relative rounded-3xl border overflow-hidden flex flex-col
        transition-all duration-700 ease-out
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        hover:-translate-y-2 hover:shadow-2xl
        ${dark ? "bg-stone-900 border-stone-800 hover:border-orange-500/60" : "bg-white border-orange-100 hover:border-orange-300"}`}
    >
      {/* glow ring on hover */}
      <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
           style={{ boxShadow: "0 0 0 2px rgba(234,88,12,0.25), 0 20px 40px -12px rgba(194,65,12,0.25)" }} />

      <div className={`relative h-36 flex items-center justify-center overflow-hidden bg-gradient-to-br ${dark ? "from-stone-800 to-stone-900" : "from-orange-50 to-orange-100"}`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-200/0 via-white/0 to-orange-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Icon className="w-12 h-12 text-orange-500 relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6" strokeWidth={1.6} />
        <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm ${dark ? "bg-stone-950 text-orange-400" : "bg-white text-orange-700"}`}>
          {item.category}
        </span>
        <span className="absolute top-3 right-3 flex items-center gap-1 bg-stone-900/70 text-white backdrop-blur-sm text-[10.5px] font-semibold px-2.5 py-1 rounded-full">
          <MapPin className="w-3 h-3" /> {item.district}
        </span>
      </div>

      <div className="p-4 pt-3.5 flex flex-col gap-2.5 flex-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full shrink-0 bg-gradient-to-br from-orange-400 to-orange-700 text-white font-bold text-[13px] flex items-center justify-center">
            {item.initial}
          </div>
          <div>
            <div className={`font-bold text-sm ${dark ? "text-stone-100" : "text-stone-900"}`}>{item.seller}</div>
            <div className={`text-xs ${dark ? "text-stone-500" : "text-stone-500"}`}>Verified seller</div>
          </div>
        </div>
        <div className={`flex items-center justify-between mt-auto pt-2 border-t border-dashed ${dark ? "border-stone-700" : "border-stone-200"}`}>
          <div className={`font-display text-xl font-semibold ${dark ? "text-orange-400" : "text-orange-700"}`}>
            ₹{item.price} <span className={`text-xs font-semibold font-sans ${dark ? "text-stone-400" : "text-stone-500"}`}>{item.unit}</span>
          </div>
          <button
            onClick={() => onDetails(item)}
            className={`group/btn inline-flex items-center gap-1.5 font-bold text-xs border rounded-full px-3.5 py-2 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-colors ${dark ? "bg-stone-800 text-orange-400 border-stone-700" : "bg-orange-50 text-orange-700 border-orange-100"}`}
          >
            Details
            <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </article>
  );
}

function FaqItem({ item, index, isOpen, onToggle, dark }) {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const panelRef = useRef(null);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${(index % 6) * 60}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div
        className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
          isOpen
            ? dark ? "border-orange-500/50 bg-stone-900 shadow-lg shadow-orange-950/20" : "border-orange-300 bg-white shadow-lg shadow-orange-100/60"
            : dark ? "border-stone-800 bg-stone-900/60 hover:border-stone-700" : "border-orange-100 bg-white/70 hover:border-orange-200"
        }`}
      >
        <button
          onClick={() => onToggle(index)}
          aria-expanded={isOpen}
          className="w-full flex items-center gap-4 text-left px-5 py-4.5 sm:px-6 sm:py-5"
        >
          <span
            className={`shrink-0 font-display text-xs font-semibold w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isOpen
                ? "bg-orange-600 text-white"
                : dark ? "bg-stone-800 text-stone-400" : "bg-orange-50 text-orange-700"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className={`flex-1 font-semibold text-[15px] sm:text-base ${dark ? "text-stone-100" : "text-stone-900"}`}>
            {item.q}
          </span>
          <span
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
              isOpen ? "rotate-45 bg-orange-600 border-orange-600 text-white" : dark ? "border-stone-700 text-stone-400 group-hover:border-orange-500 group-hover:text-orange-400" : "border-orange-200 text-orange-600 group-hover:border-orange-400"
            }`}
          >
            <Plus className="w-4 h-4" />
          </span>
        </button>
        <div
          className="grid transition-all duration-400 ease-out"
          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <p
              ref={panelRef}
              className={`px-5 sm:px-6 pb-5 sm:pb-6 pl-[3.75rem] sm:pl-[4.25rem] text-sm leading-relaxed ${dark ? "text-stone-400" : "text-stone-600"}`}
            >
              {item.a}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


function Toast({ toast }) {
  if (!toast.show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[300] animate-[toastIn_0.35s_ease-out]">
      <div className="flex items-center gap-2.5 bg-stone-900 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-2xl">
        <Sparkles className="w-4 h-4 text-orange-400" />
        {toast.msg}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Main App
--------------------------------------------------------- */
export default function AnnaSetu() {
  const [category, setCategory] = useState("all");
  const [district, setDistrict] = useState("all");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [dark, setDark] = useState(false);
  const [heroRef, heroInView] = useInView({ threshold: 0.2 });
  const [openFaq, setOpenFaq] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fireToast = useCallback((msg) => {
    setToast({ show: true, msg });
    clearTimeout(fireToast._t);
    fireToast._t = setTimeout(() => setToast({ show: false, msg: "" }), 2600);
  }, []);

  const filtered = useMemo(() => {
    return LISTINGS.filter(
      (l) => (category === "all" || l.category === category) && (district === "all" || l.district === district)
    );
  }, [category, district]);

  const toggleFaq = useCallback((i) => {
  setOpenFaq((cur) => (cur === i ? -1 : i));
}, []);

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${dark ? "bg-stone-950 text-stone-200" : "bg-orange-50 text-stone-800"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        @keyframes toastIn { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        @keyframes floatBlob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(20px,-24px) scale(1.08); } }
        @keyframes floatBlob2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-24px,20px) scale(1.05); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
      `}</style>

      {/* ================= NAVBAR ================= */}
      <header className={`sticky top-0 z-[100] transition-all duration-300 ${
        scrolled
          ? dark ? "bg-stone-950/80 backdrop-blur-md shadow-sm border-b border-stone-800" : "bg-white/80 backdrop-blur-md shadow-sm border-b border-orange-100"
          : dark ? "bg-stone-950/60 backdrop-blur-sm border-b border-transparent" : "bg-orange-50/60 backdrop-blur-sm border-b border-transparent"
      }`}>
        <div className="max-w-[1280px] mx-auto flex items-center gap-4 px-5 sm:px-7 py-3.5">
          <a href="#hero" className={`flex items-center gap-2 font-display font-bold text-xl shrink-0 ${dark ? "text-stone-100" : "text-stone-900"}`}>
            <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
              <path d="M4 20C4 20 8 8 16 8C24 8 28 20 28 20" stroke="#EA580C" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="8" cy="21" r="2.6" fill="#EA580C" /><circle cx="24" cy="21" r="2.6" fill="#C2410C" /><circle cx="16" cy="14" r="2.6" fill="#F97316" />
            </svg>
            Anna<span className="text-orange-600">Setu</span>
          </a>

          <nav className="hidden md:flex items-center gap-2 flex-1 min-w-0">
            <a href="#hero" className={`font-semibold text-sm px-3 py-2 rounded-full transition-colors ${dark ? "text-stone-300 hover:text-orange-400 hover:bg-stone-900" : "text-stone-600 hover:text-orange-700 hover:bg-orange-100"}`}>Home</a>
            <a href="#contact" className={`font-semibold text-sm px-3 py-2 rounded-full transition-colors ${dark ? "text-stone-300 hover:text-orange-400 hover:bg-stone-900" : "text-stone-600 hover:text-orange-700 hover:bg-orange-100"}`}>Contact us</a>
            <a href="#faq" className={`font-semibold text-sm px-3 py-2 rounded-full transition-colors ${dark ? "text-stone-300 hover:text-orange-400 hover:bg-stone-900" : "text-stone-600 hover:text-orange-700 hover:bg-orange-100"}`}>Faq</a>
          </nav>

          <div className="flex items-center gap-2 ml-auto md:ml-0 shrink-0">
            <button
              onClick={() => fireToast("Opening the 'List your surplus food' form…")}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-br from-orange-500 to-orange-700 text-white font-bold text-sm px-4 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Plus className="w-4 h-4" /> Sell
            </button>

            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle theme"
              aria-pressed={dark}
              title={dark ? "Switch to day mode" : "Switch to night mode"}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${dark ? "text-amber-300 hover:bg-stone-800" : "text-stone-600 hover:bg-orange-100 hover:text-orange-700"}`}
            >
              {dark ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
            </button>

            <button className={`hidden sm:flex relative w-9 h-9 rounded-full items-center justify-center transition-all ${dark ? "text-stone-300 hover:bg-stone-800 hover:text-orange-400" : "text-stone-600 hover:bg-orange-100 hover:text-orange-700"}`} title="Notifications">
              <Bell className="w-[18px] h-[18px]" />
              <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-600 border ${dark ? "border-stone-950" : "border-orange-50"}`} />
            </button>
            <button className={`hidden sm:flex w-9 h-9 rounded-full items-center justify-center transition-all ${dark ? "text-stone-300 hover:bg-stone-800 hover:text-orange-400" : "text-stone-600 hover:bg-orange-100 hover:text-orange-700"}`} title="My Orders">
              <ClipboardList className="w-[18px] h-[18px]" />
            </button>
            <button className={`hidden sm:flex w-9 h-9 rounded-full items-center justify-center transition-all ${dark ? "text-stone-300 hover:bg-stone-800 hover:text-orange-400" : "text-stone-600 hover:bg-orange-100 hover:text-orange-700"}`} title="My Listings">
              <LayoutGrid className="w-[18px] h-[18px]" />
            </button>
            <button className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center bg-gradient-to-br from-orange-400 to-orange-700 text-white font-bold text-sm border-2 border-white shadow-md hover:scale-105 hover:-rotate-3 transition-transform" title="Profile">
              S
            </button>

            <button onClick={() => setMobileOpen(true)} className={`md:hidden w-9 h-9 flex items-center justify-center ${dark ? "text-stone-100" : "text-stone-800"}`} aria-label="Menu">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE MENU ================= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] bg-stone-900/50" onClick={(e) => e.target === e.currentTarget && setMobileOpen(false)}>
          <div className={`absolute top-0 right-0 h-full w-[86%] max-w-[320px] p-6 shadow-2xl flex flex-col gap-4 animate-[toastIn_0.3s_ease-out] ${dark ? "bg-stone-950 text-stone-200" : "bg-orange-50"}`}>
            <button onClick={() => setMobileOpen(false)} className={dark ? "self-end text-stone-300" : "self-end text-stone-600"} aria-label="Close menu">
              <X className="w-6 h-6" />
            </button>
            <a href="#hero" className={`py-2.5 font-semibold border-b ${dark ? "border-stone-800" : "border-orange-100"}`} onClick={() => setMobileOpen(false)}>Home</a>
            <a href="#contact" className={`py-2.5 font-semibold border-b ${dark ? "border-stone-800" : "border-orange-100"}`} onClick={() => setMobileOpen(false)}>Contact us</a>
            <span className={`py-2.5 font-semibold border-b ${dark ? "border-stone-800 text-stone-500" : "border-orange-100 text-stone-500"}`}>My Orders</span>
            <span className={`py-2.5 font-semibold border-b ${dark ? "border-stone-800 text-stone-500" : "border-orange-100 text-stone-500"}`}>My Listings</span>
            <span className={`py-2.5 font-semibold border-b ${dark ? "border-stone-800 text-stone-500" : "border-orange-100 text-stone-500"}`}>Notifications</span>
            <button
              onClick={() => { fireToast("Opening the 'List your surplus food' form…"); setMobileOpen(false); }}
              className="flex items-center justify-center gap-1.5 bg-gradient-to-br from-orange-500 to-orange-700 text-white font-bold text-sm px-4 py-2.5 rounded-full shadow-md"
            >
              <Plus className="w-4 h-4" /> List your surplus
            </button>

            <div>
              <label className={`text-xs font-bold ${dark ? "text-stone-400" : "text-stone-500"}`}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className={`w-full mt-1.5 font-semibold text-sm px-3.5 py-2.5 rounded-full border ${dark ? "bg-stone-900 border-stone-700 text-stone-100" : "bg-white border-orange-100 text-stone-800"}`}>
                <option value="all">All categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`text-xs font-bold ${dark ? "text-stone-400" : "text-stone-500"}`}>District</label>
              <select value={district} onChange={(e) => setDistrict(e.target.value)}
                className={`w-full mt-1.5 font-semibold text-sm px-3.5 py-2.5 rounded-full border ${dark ? "bg-stone-900 border-stone-700 text-stone-100" : "bg-white border-orange-100 text-stone-800"}`}>
                <option value="all">All districts</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section id="hero" ref={heroRef} className="relative max-w-[1280px] mx-auto px-5 sm:px-7 pt-14 pb-10 overflow-hidden">
        {/* ambient blobs */}
        <div className={`pointer-events-none absolute -top-20 -left-24 w-72 h-72 rounded-full blur-3xl ${dark ? "bg-orange-900/30" : "bg-orange-200/50"}`} style={{ animation: "floatBlob 9s ease-in-out infinite" }} />
        <div className={`pointer-events-none absolute top-10 -right-16 w-80 h-80 rounded-full blur-3xl ${dark ? "bg-amber-900/20" : "bg-amber-200/40"}`} style={{ animation: "floatBlob2 11s ease-in-out infinite" }} />

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className={`transition-all duration-700 ${heroInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className={`inline-flex items-center gap-2 font-bold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-full mb-5 ${dark ? "bg-stone-900 text-orange-400" : "bg-orange-100 text-orange-700"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live across 14 districts of Kerala
            </div>

            <h1 className={`font-display text-[2.5rem] sm:text-5xl lg:text-6xl leading-[1.15] tracking-tight font-semibold mb-5 ${dark ? "text-stone-50" : "text-stone-900"}`}>
              Every plate of{" "}
              <em className="italic text-orange-600 not-italic-fallback">surplus</em>{" "}
              finds a hungry{" "}
              <em className="italic text-orange-600">need</em>.
            </h1>

            <p className={`text-base sm:text-lg leading-relaxed max-w-md mb-8 ${dark ? "text-stone-400" : "text-stone-600"}`}>
              Anna Setu is the bridge between kitchens with extra food and neighbours who need it restaurants, home cooks and farms list what's spare, and it reaches someone nearby before it's wasted.
            </p>
            <div className="flex gap-3.5 flex-wrap">
              <button
                onClick={() => document.getElementById("grid")?.scrollIntoView({ behavior: "smooth" })}
                className={`group inline-flex items-center gap-2 font-bold text-sm px-6 py-4 rounded-full shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all ${dark ? "bg-orange-600 text-white hover:bg-orange-500" : "bg-stone-900 text-white hover:bg-orange-700"}`}
              >
                Browse food nearby
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => fireToast("Opening the 'List your surplus food' form…")}
                className={`font-bold text-sm px-6 py-4 rounded-full border hover:-translate-y-0.5 transition-all ${dark ? "bg-stone-900/70 text-stone-100 border-stone-700 hover:border-orange-500 hover:bg-stone-900" : "bg-white/70 text-stone-800 border-stone-300 hover:border-orange-500 hover:bg-orange-50"}`}
              >
                List your surplus
              </button>
            </div>
            <div className="flex gap-7 mt-9 flex-wrap">
              {STATS.map((s) => <StatBlock key={s.label} stat={s} start={heroInView} dark={dark} />)}
            </div>
          </div>

          <div className="order-first md:order-last">
            <svg className="w-full h-auto" viewBox="0 0 420 260" fill="none">
              <path
                id="bridgePath"
                d="M40 180 C 120 60, 300 60, 380 180"
                stroke={dark ? "#9A3412" : "#FDBA74"}
                strokeWidth="4"
                strokeDasharray="2 10"
                strokeLinecap="round"
              />
              <g>
                <rect x="14" y="170" width="76" height="60" rx="10" fill={dark ? "#7C2D12" : "#FED7AA"} />
                <rect x="26" y="186" width="52" height="34" rx="6" fill="#F97316" />
                <path d="M26 200h52M40 186v34M64 186v34" stroke="#C2410C" strokeWidth="2" />
              </g>
              <g>
                <circle cx="368" cy="198" r="38" fill={dark ? "#7C2D12" : "#FED7AA"} />
                <path d="M353 210c6 10 24 10 30 -2" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" fill="none" />
                <circle cx="358" cy="190" r="5" fill="#EA580C" /><circle cx="378" cy="190" r="5" fill="#EA580C" />
              </g>

              {/* dots genuinely travel along the bridge path, start to end, then fade/reset */}
              <circle r="6" fill="#EA580C">
                <animateMotion dur="4.5s" repeatCount="indefinite" begin="0s" rotate="0">
                  <mpath href="#bridgePath" />
                </animateMotion>
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur="4.5s" repeatCount="indefinite" begin="0s" />
              </circle>
              <circle r="5" fill="#F97316">
                <animateMotion dur="4.5s" repeatCount="indefinite" begin="1.4s">
                  <mpath href="#bridgePath" />
                </animateMotion>
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur="4.5s" repeatCount="indefinite" begin="1.4s" />
              </circle>
              <circle r="5.5" fill="#FDBA74">
                <animateMotion dur="4.5s" repeatCount="indefinite" begin="2.8s">
                  <mpath href="#bridgePath" />
                </animateMotion>
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" dur="4.5s" repeatCount="indefinite" begin="2.8s" />
              </circle>

              <text x="210" y="30" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="15" fill={dark ? "#FDBA74" : "#C2410C"} fontWeight="600">Anna Setu</text>
            </svg>
          </div>
        </div>
      </section>

      {/* ================= FILTERS + RESULTS ================= */}
      <div className="max-w-[1280px] mx-auto px-5 sm:px-7 pt-2">
        <div className="flex items-baseline justify-between flex-wrap gap-2.5 mb-4">
          <h2 className={`font-display text-2xl font-semibold m-0 ${dark ? "text-stone-100" : "text-stone-900"}`}>Food available near you</h2>
          <span className={`text-sm font-semibold ${dark ? "text-stone-400" : "text-stone-500"}`}>
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2.5 flex-wrap mb-2">
          <button
            onClick={() => setCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              category === "all"
                ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                : dark ? "bg-stone-900 text-stone-300 border-stone-700 hover:border-orange-500" : "bg-white text-stone-600 border-orange-100 hover:border-orange-300"
            }`}
          >
            All categories
          </button>
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICON[c];
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  active
                    ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                    : dark ? "bg-stone-900 text-stone-300 border-stone-700 hover:border-orange-500" : "bg-white text-stone-600 border-orange-100 hover:border-orange-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {c}
              </button>
            );
          })}

          <div className="relative ml-auto">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className={`appearance-none font-semibold text-sm pl-4 pr-9 py-2.5 rounded-full border focus:outline-none focus:ring-4 transition-colors ${
                dark ? "bg-stone-900 border-stone-700 text-stone-100 hover:border-orange-500 focus:ring-orange-900/40" : "bg-white border-orange-100 text-stone-800 hover:border-orange-400 focus:ring-orange-100"
              }`}
            >
              <option value="all">All districts</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-orange-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ================= CARD GRID ================= */}
      <section id="grid" className="max-w-[1280px] mx-auto px-5 sm:px-7 pt-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} dark={dark} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-20 px-5 ${dark ? "text-stone-500" : "text-stone-500"}`}>
            <Search className="w-14 h-14 mx-auto mb-3.5 text-orange-300" strokeWidth={1.4} />
            <h3 className={`mb-1.5 font-display text-lg ${dark ? "text-stone-200" : "text-stone-800"}`}>No listings match yet</h3>
            <p>Try a different category or district.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item, i) => (
              <ListingCard key={item.id} item={item} index={i} onDetails={(it) => fireToast(`Opening details for ${it.seller}…`)} dark={dark} />
            ))}
          </div>
        )}
      </section>
 
 
      {/* ================= FAQ ================= */}
      <section id="faq" className="relative max-w-[1280px] mx-auto px-5 sm:px-7 py-20 overflow-hidden">
        <div className={`pointer-events-none absolute top-1/3 -left-32 w-96 h-96 rounded-full blur-3xl ${dark ? "bg-orange-900/10" : "bg-orange-100/60"}`} />
 
        <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,340px)_1fr] gap-10 lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className={`inline-flex items-center gap-2 font-bold text-xs tracking-wider uppercase px-3.5 py-1.5 rounded-full mb-5 ${dark ? "bg-stone-900 text-orange-400" : "bg-orange-100 text-orange-700"}`}>
              <HelpCircle className="w-3.5 h-3.5" /> Good to know
            </div>
            <h2 className={`font-display text-3xl sm:text-4xl font-semibold leading-[1.15] mb-4 ${dark ? "text-stone-50" : "text-stone-900"}`}>
              Questions, answered.
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed max-w-sm ${dark ? "text-stone-400" : "text-stone-600"}`}>
              Everything you need to know before you buy your first plate or list your first batch. Still stuck? Reach out — we read every message.
            </p>
            <button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className={`mt-7 inline-flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-full border transition-all hover:-translate-y-0.5 ${dark ? "border-stone-700 text-stone-100 hover:border-orange-500 hover:bg-stone-900" : "border-stone-300 text-stone-800 hover:border-orange-400 hover:bg-orange-50"}`}
            >
              Get in touch
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
 
          <div className="flex flex-col gap-3">
            {FAQS.map((item, i) => (
              <FaqItem key={item.q} item={item} index={i} isOpen={openFaq === i} onToggle={toggleFaq} dark={dark} />
            ))}
          </div>
        </div>
      </section>
      

      <footer id="contact" className="bg-stone-900 text-stone-400 px-7 py-8 text-center text-sm">
        <p><b className="text-orange-400">Anna Setu</b> — a bridge between surplus and need, built across Kerala.</p>
        <p>Contact us: hello@annasetu.in · +91 90000 00000</p>
      </footer>

      <Toast toast={toast} />
    </div>
  );
}