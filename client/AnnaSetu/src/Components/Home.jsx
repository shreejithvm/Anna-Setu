import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Menu, X, Sun, Moon, MapPin, ArrowRight, ArrowLeft, Plus, Bell,
  ClipboardList, LayoutGrid, ChevronDown, UtensilsCrossed,
  Apple, Croissant, Milk, Wheat, Package, Search, Sparkles, HelpCircle
} from "lucide-react";
import { getuser } from "../api/fetchApi";
/* ---------------------------------------------------------
   Static data
--------------------------------------------------------- */
const CATEGORIES = ["Cooked Meals", "Fruits & Vegetables", "Bakery", "Dairy", "Grains & Staples", "Packaged Food"];

// The 14 districts of Kerala, each with a short cultural tagline and a
// "motif" key that picks which hand-drawn traditional icon represents it.
const DISTRICTS = [
  { name: "Trivandram", tagline: "Temple city & capital", motif: "temple" },
  { name: "Kollam", tagline: "Cashew country & backwaters", motif: "cashew" },
  { name: "Pathanamthitta", tagline: "Gateway to the pilgrim hills", motif: "hillsteps" },
  { name: "Alappuzha", tagline: "Venice of the East", motif: "houseboat" },
  { name: "Kottayam", tagline: "Land of letters & rubber", motif: "leaf" },
  { name: "Idukki", tagline: "Misty dams & spice hills", motif: "dam" },
  { name: "Ernakulam", tagline: "Kochi's Chinese fishing nets", motif: "fishingnet" },
  { name: "Thrissur", tagline: "Cultural capital of Kerala", motif: "elephant" },
  { name: "Palakkad", tagline: "Gateway of Kerala, paddy & wind", motif: "windmill" },
  { name: "Malappuram", tagline: "Heart of the Malabar coast", motif: "dome" },
  { name: "Kozhikode", tagline: "Historic spice coast", motif: "pepper" },
  { name: "Wayanad", tagline: "Green tea hills & wildlife", motif: "teahills" },
  { name: "Kannur", tagline: "Land of Theyyam", motif: "mask" },
  { name: "Kasaragod", tagline: "Coconut coast", motif: "palmbeach" },
];
const DISTRICT_NAMES = DISTRICTS.map((d) => d.name);

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
    a: "Sellers list only what they'd otherwise waste that day — extra plates from a lunch service, produce that won't keep till tomorrow, or a bakery's end-of-day stock. You always see the category, quantity, and price before you commit to anything.",
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
    a: "We currently operate across all 14 districts of Kerala, from Kasaragod to Thiruvananthapuram — tap a district's card above to see what's available there.",
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
   Hand-drawn "traditional" district motifs (original line art,
   no photos / no copyrighted or real-landmark reproductions).
--------------------------------------------------------- */
function DistrictMotif({ motif, className }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };
  const paths = {
    temple: (
      <>
        <rect x="20" y="48" width="24" height="6" {...common} />
        <rect x="22" y="42" width="20" height="6" {...common} />
        <rect x="24" y="36" width="16" height="6" {...common} />
        <rect x="26" y="30" width="12" height="6" {...common} />
        <rect x="28" y="24" width="8" height="6" {...common} />
        <path d="M30 24 L32 15 L34 24 Z" {...common} />
        <line x1="32" y1="15" x2="32" y2="9" {...common} />
        <circle cx="32" cy="8" r="1.6" fill="currentColor" />
        <rect x="29" y="46" width="6" height="8" rx="1" {...common} />
      </>
    ),
    cashew: (
      <>
        <path d="M20 38c-4-9 3-19 13-17 9 2 12 13 5 20-5 5-13 4-18-3z" {...common} />
        <path d="M31 21c2-4 6-6 9-5" {...common} />
      </>
    ),
    hillsteps: (
      <>
        <path d="M8 48 L24 26 L40 48 Z" {...common} />
        <path d="M13 44h4M17 38h4M21 32h4" {...common} />
        <line x1="24" y1="26" x2="24" y2="18" {...common} />
        <path d="M24 18 L32 21 L24 24 Z" fill="currentColor" stroke="none" />
      </>
    ),
    houseboat: (
      <>
        <path d="M10 42 Q32 50 54 42 L50 47 Q32 53 14 47 Z" {...common} />
        <path d="M16 42 Q32 25 48 42" {...common} />
        <path d="M6 51 Q14 47 22 51 T38 51 T54 51" {...common} />
      </>
    ),
    leaf: (
      <>
        <line x1="32" y1="50" x2="32" y2="24" {...common} />
        <path d="M32 30c-8-2-12-10-8-18 8 2 12 10 8 18z" {...common} />
        <path d="M32 30c8-2 12-10 8-18-8 2-12 10-8 18z" {...common} />
      </>
    ),
    dam: (
      <>
        <path d="M8 30 L20 13 L30 30Z" {...common} />
        <path d="M28 30 L40 9 L56 30Z" {...common} />
        <rect x="14" y="30" width="36" height="14" rx="2" {...common} />
        <path d="M10 49h44M14 53h36" {...common} />
      </>
    ),
    fishingnet: (
      <>
        <line x1="32" y1="10" x2="32" y2="46" {...common} />
        <path d="M32 14 L14 25 M32 14 L50 25" {...common} />
        <path d="M14 25 Q32 38 50 25" {...common} />
        <path d="M20 27 L20 36M28 31 L28 40M36 31 L36 40M44 27 L44 36" {...common} />
      </>
    ),
    elephant: (
      <>
        {/* Main Body with Dome Skull, Arched Spine & Solid Pillar Legs */}
        <path
          d="M38 34c3-1 9-1 13-4 3-3 2-8-1-11-4-4-10-3-15-1-3 1-5 2-8 2-6 0-11-3-16-1-5 2-7 7-7 12 0 6 1 12 1 17v3h6v-5c1 0 4 0 5-1v6h6v-8c2 0 4 0 6 1v7h6v-8c2-2 3-5 4-10"
          {...common}
        />
        {/* Anatomical Ear with Inner Fold */}
        <path
          d="M27 21c5-1 10 2 10 9 0 7-5 12-10 11-4-1-5-6-4-10 1-5 2-9 4-10z"
          {...common}
        />
        {/* Curved Prehensile Trunk */}
        <path
          d="M48 23c4-3 8-1 8 4 0 6-5 12-11 13-3 1-6-1-6-3 0-2 2-3 4-2 3 1 5-1 6-4"
          {...common}
        />
        {/* Graceful Ivory Tusk */}
        <path
          d="M40 37c4 1 8 4 9 8-2 0-5-3-7-5"
          {...common}
        />
        {/* Natural Eye Placement */}
        <circle cx="39" cy="24" r="1.5" fill="currentColor" stroke="none" />
        {/* Slender Tufted Tail */}
        <path
          d="M7 32c-2 4-2 9 0 13"
          {...common}
        />
      </>
    ),
    windmill: (
      <>
        <line x1="32" y1="18" x2="32" y2="52" {...common} />
        <path d="M32 18 L40 10 M32 18 L24 10 M32 18 L40 26 M32 18 L24 26" {...common} />
        <circle cx="32" cy="18" r="1.6" fill="currentColor" stroke="none" />
        <path d="M10 52h44" {...common} />
        <path d="M14 48h4M22 48h4M30 48h4M38 48h4M46 48h4" {...common} />
      </>
    ),
    dome: (
      <>
        <path d="M22 50 V34 A10 10 0 0 1 42 34 V50Z" {...common} />
        <line x1="32" y1="24" x2="32" y2="16" {...common} />
        <circle cx="32" cy="14" r="1.8" fill="currentColor" stroke="none" />
        <rect x="15" y="38" width="4" height="12" {...common} />
        <rect x="45" y="38" width="4" height="12" {...common} />
        <path d="M28 50v-8a4 4 0 0 1 8 0v8" {...common} />
      </>
    ),
    pepper: (
      <>
        <path d="M22 12c4 6 4 12 0 18s-4 12 0 18" {...common} />
        <circle cx="24" cy="18" r="2" fill="currentColor" stroke="none" />
        <circle cx="19" cy="26" r="2" fill="currentColor" stroke="none" />
        <circle cx="24" cy="34" r="2" fill="currentColor" stroke="none" />
        <circle cx="19" cy="42" r="2" fill="currentColor" stroke="none" />
        <path d="M22 12c6-2 10 2 8 8-6 0-10-4-8-8z" {...common} />
      </>
    ),
    teahills: (
      <>
        <path d="M6 46c8-10 14-10 20-2 6-8 14-8 20 0 4-4 8-4 12 0" {...common} />
        <path d="M10 42h4M18 40h4M26 38h4M34 40h4M42 42h4" {...common} />
        <path d="M8 51h48" strokeDasharray="2 5" {...common} />
      </>
    ),
    mask: (
      <>
        <circle cx="32" cy="34" r="10" {...common} />
        <path d="M32 14 L32 22 M24 16 L27 24 M40 16 L37 24 M18 22 L24 28 M46 22 L40 28" {...common} />
        <circle cx="28" cy="32" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="36" cy="32" r="1.3" fill="currentColor" stroke="none" />
        <path d="M27 39c3 3 7 3 10 0" {...common} />
      </>
    ),
    palmbeach: (
      <>
        <path d="M20 52c0-14 4-22 10-28" {...common} />
        <path d="M30 24c-6-4-10-2-12 2M30 24c-2-6 0-10 4-12M30 24c4-4 8-2 10 2M30 24c6 0 8 4 6 8M30 24c2 4 0 8-4 10" {...common} />
        <circle cx="29" cy="27" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="32" cy="29" r="1.5" fill="currentColor" stroke="none" />
        <path d="M6 52c6-3 10 3 16 0s10 3 16 0 10 3 16 0" {...common} />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 64 64" className={className}>
      {paths[motif] || paths.temple}
    </svg>
  );
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

function DistrictCard({ district, count, index, onSelect, dark }) {
  const [ref, inView] = useInView({ threshold: 0.15 });
  return (
    <button
      ref={ref}
      // onClick={() => onSelect(district.name)}
      style={{ transitionDelay: inView ? `${(index % 8) * 50}ms` : "0ms" }}
      className={`group relative rounded-3xl border overflow-hidden flex flex-col text-left
        transition-all duration-700 ease-out
        ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
        hover:-translate-y-2 hover:shadow-2xl
        ${dark ? "bg-stone-900 border-stone-800 hover:border-orange-500/60" : "bg-white border-orange-100 hover:border-orange-300"}`}
    >
      <div className={`relative h-32 flex items-center justify-center overflow-hidden bg-gradient-to-br ${dark ? "from-stone-800 to-stone-900" : "from-orange-50 to-orange-100"}`}>
        <DistrictMotif
          motif={district.motif}
          className={`w-14 h-14 relative z-10 transition-transform duration-500 group-hover:scale-110 ${dark ? "text-orange-400" : "text-orange-600"}`}
        />
        <span className={`absolute top-3 right-3 text-[10.5px] font-bold px-2.5 py-1 rounded-full shadow-sm ${dark ? "bg-stone-950 text-orange-400" : "bg-white text-orange-700"}`}>
          {count > 0 ? `${count} listing${count !== 1 ? "s" : ""}` : "Coming soon"}
        </span>
      </div>
      <div className="p-4 pt-3.5 flex flex-col gap-1.5 flex-1">
        <div className={`font-display font-semibold text-base leading-snug ${dark ? "text-stone-100" : "text-stone-900"}`}>{district.name}</div>
        <div className={`text-xs ${dark ? "text-stone-500" : "text-stone-500"}`}>{district.tagline}</div>
        <div className={`mt-auto pt-2.5 inline-flex items-center gap-1.5 font-bold text-xs ${dark ? "text-orange-400" : "text-orange-700"}`}>
          Explore food <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
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
  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${(index % 6) * 60}ms` : "0ms" }}
      className={`transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      <div
        className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${isOpen
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
            className={`shrink-0 font-display text-xs font-semibold w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-300 ${isOpen
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
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${isOpen ? "rotate-45 bg-orange-600 border-orange-600 text-white" : dark ? "border-stone-700 text-stone-400 group-hover:border-orange-500 group-hover:text-orange-400" : "border-orange-200 text-orange-600 group-hover:border-orange-400"
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
            <p className={`px-5 sm:px-6 pb-5 sm:pb-6 pl-[3.75rem] sm:pl-[4.25rem] text-sm leading-relaxed ${dark ? "text-stone-400" : "text-stone-600"}`}>
              {item.a}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
//  only added this and need to set profile sectiion in nav bar
function ProfileMenu({ user, onViewMore, onLogout, dark }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 transition-all
          bg-gradient-to-br from-orange-400 to-orange-700 text-white
          ${open ? "ring-2 ring-orange-500 ring-offset-2" : "hover:opacity-90"}
          ${open && dark ? "ring-offset-stone-950" : "ring-offset-white"}`}
      >
        {user.initial}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 mt-2.5 w-64 rounded-2xl border shadow-2xl overflow-hidden z-[150] animate-[toastIn_0.2s_ease-out]
            ${dark ? "bg-stone-900 border-stone-800" : "bg-white border-orange-100"}`}
        >
          {/* user summary */}
          <div className={`flex items-center gap-3 px-4 py-4 border-b ${dark ? "border-stone-800" : "border-orange-100"}`}>
            <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-sm bg-gradient-to-br from-orange-400 to-orange-700 text-white">
              {user.initial}
            </div>
            <div className="min-w-0">
              <div className={`font-bold text-sm truncate ${dark ? "text-stone-100" : "text-stone-900"}`}>{user.name}</div>
              <div className={`text-xs truncate ${dark ? "text-stone-500" : "text-stone-500"}`}>{user.email}</div>
            </div>
          </div>

          {/* menu list */}
          <div className="py-1.5">
            <button
              role="menuitem"
              onClick={() => { setOpen(false); onViewMore?.(); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-left transition-colors
                ${dark ? "text-stone-200 hover:bg-stone-800" : "text-stone-700 hover:bg-orange-50"}`}
            >
              <User className="w-4 h-4 text-orange-500" />
              <span className="flex-1">View more</span>
              <ChevronRight className="w-4 h-4 opacity-40" />
            </button>

            <button
              role="menuitem"
              onClick={() => { setOpen(false); onLogout?.(); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-left transition-colors
                ${dark ? "text-red-400 hover:bg-stone-800" : "text-red-600 hover:bg-red-50"}`}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
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
  // "home" = browse-by-district landing page. "district" = a single
  // district's food listings (with its own category filter).
  const [view, setView] = useState("home");
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [category, setCategory] = useState("all");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [dark, setDark] = useState(false);
  const [heroRef, heroInView] = useInView({ threshold: 0.2 });
  const [openFaq, setOpenFaq] = useState(0);

  // Session state lives in memory only (no router/localStorage in this environment).
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Track the pending toast-hide timeout in a ref instead of stashing it on
  // the callback function itself (mutating a function object is fragile and
  // breaks under React StrictMode's double-invoke / hot reload).
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Clean up any pending toast timeout on unmount so it never fires after
  // the component (or its state setters) are gone.
  useEffect(() => {
    return () => clearTimeout(toastTimeoutRef.current);
  }, []);

  const fireToast = useCallback((msg) => {
    setToast({ show: true, msg });
    clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast({ show: false, msg: "" }), 2600);
  }, []);

  const districtCounts = useMemo(() => {
    const counts = {};
    DISTRICT_NAMES.forEach((d) => { counts[d] = 0; });
    LISTINGS.forEach((l) => { counts[l.district] = (counts[l.district] || 0) + 1; });
    return counts;
  }, []);

  const districtListings = useMemo(() => {
    if (!selectedDistrict) return [];
    return LISTINGS.filter(
      (l) => l.district === selectedDistrict && (category === "all" || l.category === category)
    );
  }, [selectedDistrict, category]);

  const toggleFaq = useCallback((i) => {
    setOpenFaq((cur) => (cur === i ? -1 : i));
  }, []);

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
    fireToast("Logged in");
  }, [fireToast]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    fireToast("Logged out");
  }, [fireToast]);

  const goHome = useCallback(() => {
    setView("home");
    setSelectedDistrict(null);
    setCategory("all");
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openDistrict = useCallback((districtName) => {
    setSelectedDistrict(districtName);
    setCategory("all");
    setView("district");
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const districtMeta = DISTRICTS.find((d) => d.name === selectedDistrict);

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
      <header className={`sticky top-0 z-[100] transition-all duration-300 ${scrolled
          ? dark ? "bg-stone-950/80 backdrop-blur-md shadow-sm border-b border-stone-800" : "bg-white/80 backdrop-blur-md shadow-sm border-b border-orange-100"
          : dark ? "bg-stone-950/60 backdrop-blur-sm border-b border-transparent" : "bg-orange-50/60 backdrop-blur-sm border-b border-transparent"
        }`}>
        <div className="max-w-[1280px] mx-auto flex items-center gap-4 px-5 sm:px-7 py-3.5">
          <button onClick={goHome} className={`flex items-center gap-2 font-display font-bold text-xl shrink-0 ${dark ? "text-stone-100" : "text-stone-900"}`}>
            <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
              <path d="M4 20C4 20 8 8 16 8C24 8 28 20 28 20" stroke="#EA580C" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="8" cy="21" r="2.6" fill="#EA580C" /><circle cx="24" cy="21" r="2.6" fill="#C2410C" /><circle cx="16" cy="14" r="2.6" fill="#F97316" />
            </svg>
            Anna<span className="text-orange-600">Setu</span>
          </button>

          <nav className="hidden md:flex items-center gap-2 flex-1 min-w-0">
            <button onClick={goHome} className={`font-semibold text-sm px-3 py-2 rounded-full transition-colors ${dark ? "text-stone-300 hover:text-orange-400 hover:bg-stone-900" : "text-stone-600 hover:text-orange-700 hover:bg-orange-100"}`}>Home</button>
            <button onClick={() => { goHome(); setTimeout(() => document.getElementById("districts")?.scrollIntoView({ behavior: "smooth" }), 50); }} className={`font-semibold text-sm px-3 py-2 rounded-full transition-colors ${dark ? "text-stone-300 hover:text-orange-400 hover:bg-stone-900" : "text-stone-600 hover:text-orange-700 hover:bg-orange-100"}`}>Districts</button>
            <a href="#faq" className={`font-semibold text-sm px-3 py-2 rounded-full transition-colors ${dark ? "text-stone-300 hover:text-orange-400 hover:bg-stone-900" : "text-stone-600 hover:text-orange-700 hover:bg-orange-100"}`}>Faq</a>
            <a href="#contact" className={`font-semibold text-sm px-3 py-2 rounded-full transition-colors ${dark ? "text-stone-300 hover:text-orange-400 hover:bg-stone-900" : "text-stone-600 hover:text-orange-700 hover:bg-orange-100"}`}>Contact us</a>
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

            {/* Login / Profile — in-memory session state, no router or localStorage in this environment */}
            {!isLoggedIn ? (
              <button
                onClick={handleLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
              >
                Login
              </button>
            ) : (
              <ProfileMenu
                user={{
                  name: User.name,
                  email: User.email,
                  initial: currentUser.name?.[0]?.toUpperCase() || "?",
                }}
                onViewMore={() => fireToast("Opening your profile…")}
                onLogout={handleLogout}
                dark={dark}
              />
            )}

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
            <button onClick={goHome} className={`py-2.5 font-semibold border-b text-left ${dark ? "border-stone-800" : "border-orange-100"}`}>Home</button>
            <button
              onClick={() => { goHome(); setTimeout(() => document.getElementById("districts")?.scrollIntoView({ behavior: "smooth" }), 50); }}
              className={`py-2.5 font-semibold border-b text-left ${dark ? "border-stone-800" : "border-orange-100"}`}
            >
              Districts
            </button>
            <a href="#faq" className={`py-2.5 font-semibold border-b ${dark ? "border-stone-800" : "border-orange-100"}`} onClick={() => setMobileOpen(false)}>Faq</a>
            <a href="#contact" className={`py-2.5 font-semibold border-b ${dark ? "border-stone-800" : "border-orange-100"}`} onClick={() => setMobileOpen(false)}>Contact us</a>
            <span className={`py-2.5 font-semibold border-b ${dark ? "border-stone-800 text-stone-500" : "border-orange-100 text-stone-500"}`}>My Orders</span>
            <span className={`py-2.5 font-semibold border-b ${dark ? "border-stone-800 text-stone-500" : "border-orange-100 text-stone-500"}`}>My Listings</span>
            <span className={`py-2.5 font-semibold border-b ${dark ? "border-stone-800 text-stone-500" : "border-orange-100 text-stone-500"}`}>Notifications</span>
            <button
              onClick={isLoggedIn ? handleLogout : handleLogin}
              className={`py-2.5 font-semibold border-b text-left ${dark ? "border-stone-800" : "border-orange-100"}`}
            >
              {isLoggedIn ? "Logout" : "Login"}
            </button>
            <button
              onClick={() => { fireToast("Opening the 'List your surplus food' form…"); setMobileOpen(false); }}
              className="flex items-center justify-center gap-1.5 bg-gradient-to-br from-orange-500 to-orange-700 text-white font-bold text-sm px-4 py-2.5 rounded-full shadow-md"
            >
              <Plus className="w-4 h-4" /> List your surplus
            </button>
          </div>
        </div>
      )}

      {view === "home" ? (
        <>
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
                  <em className="not-italic text-orange-600">surplus</em>{" "}
                  finds a hungry{" "}
                  <em className="not-italic text-orange-600">need</em>.
                </h1>

                <p className={`text-base sm:text-lg leading-relaxed max-w-md mb-8 ${dark ? "text-stone-400" : "text-stone-600"}`}>
                  Anna Setu is the bridge between kitchens with extra food and neighbours who need it — restaurants, home cooks and farms list what's spare, and it reaches someone nearby before it's wasted.
                </p>
                <div className="flex gap-3.5 flex-wrap">
                  <button
                    onClick={() => document.getElementById("districts")?.scrollIntoView({ behavior: "smooth" })}
                    className={`group inline-flex items-center gap-2 font-bold text-sm px-6 py-4 rounded-full shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all ${dark ? "bg-orange-600 text-white hover:bg-orange-500" : "bg-stone-900 text-white hover:bg-orange-700"}`}
                  >
                    Browse by district
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

          {/* ================= DISTRICT GRID ================= */}
          <section id="districts" className="max-w-[1280px] mx-auto px-5 sm:px-7 pt-2 pb-24">
            <div className="flex items-baseline justify-between flex-wrap gap-2.5 mb-5">
              <h2 className={`font-display text-2xl font-semibold m-0 ${dark ? "text-stone-100" : "text-stone-900"}`}>Explore food by district</h2>
              <span className={`text-sm font-semibold ${dark ? "text-stone-400" : "text-stone-500"}`}>14 districts of Kerala</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-5">
              {DISTRICTS.map((d, i) => (
                <DistrictCard key={d.name} district={d} count={districtCounts[d.name]} index={i} onSelect={openDistrict} dark={dark} />
              ))}
            </div>
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
        </>
      ) : (
        <>
          {/* ================= DISTRICT PAGE ================= */}
          <section className="max-w-[1280px] mx-auto px-5 sm:px-7 pt-8">
            <button
              onClick={goHome}
              className={`inline-flex items-center gap-1.5 font-bold text-sm mb-5 ${dark ? "text-stone-400 hover:text-orange-400" : "text-stone-500 hover:text-orange-700"}`}
            >
              <ArrowLeft className="w-4 h-4" /> All districts
            </button>

            <div className="flex items-center gap-4 mb-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${dark ? "from-stone-800 to-stone-900" : "from-orange-50 to-orange-100"}`}>
                <DistrictMotif motif={districtMeta?.motif} className={`w-9 h-9 ${dark ? "text-orange-400" : "text-orange-600"}`} />
              </div>
              <div>
                <h1 className={`font-display text-2xl sm:text-3xl font-semibold ${dark ? "text-stone-50" : "text-stone-900"}`}>{selectedDistrict}</h1>
                <p className={`text-sm ${dark ? "text-stone-400" : "text-stone-500"}`}>{districtMeta?.tagline}</p>
              </div>
            </div>

            <div className="flex items-baseline justify-between flex-wrap gap-2.5 mt-6 mb-4">
              <h2 className={`font-display text-xl font-semibold m-0 ${dark ? "text-stone-100" : "text-stone-900"}`}>Food available here</h2>
              <span className={`text-sm font-semibold ${dark ? "text-stone-400" : "text-stone-500"}`}>
                {districtListings.length} listing{districtListings.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* category filter, scoped to this district */}
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <button
                onClick={() => setCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${category === "all"
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
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${active
                        ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                        : dark ? "bg-stone-900 text-stone-300 border-stone-700 hover:border-orange-500" : "bg-white text-stone-600 border-orange-100 hover:border-orange-300"
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {c}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ================= CARD GRID ================= */}
          <section id="grid" className="max-w-[1280px] mx-auto px-5 sm:px-7 pt-6 pb-24">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} dark={dark} />)}
              </div>
            ) : districtListings.length === 0 ? (
              <div className={`text-center py-20 px-5 ${dark ? "text-stone-500" : "text-stone-500"}`}>
                <Search className="w-14 h-14 mx-auto mb-3.5 text-orange-300" strokeWidth={1.4} />
                <h3 className={`mb-1.5 font-display text-lg ${dark ? "text-stone-200" : "text-stone-800"}`}>No listings match yet</h3>
                <p>Try a different category, or check back soon for {selectedDistrict}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {districtListings.map((item, i) => (
                  <ListingCard key={item.id} item={item} index={i} onDetails={(it) => fireToast(`Opening details for ${it.seller}…`)} dark={dark} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <footer id="contact" className="bg-stone-900 text-stone-400 px-7 py-8 text-center text-sm">
        <p><b className="text-orange-400">Anna Setu</b> — a bridge between surplus and need, built across Kerala.</p>
        <p>Contact us: hello@annasetu.in · +91 90000 00000</p>
      </footer>

      <Toast toast={toast} />
    </div>
  );
}