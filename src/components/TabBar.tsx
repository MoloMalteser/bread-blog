import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Home, Search, PlusSquare, Heart, User, LucideProps } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

interface TabItem {
  id: string;
  icon: React.ComponentType<LucideProps>;
  path: string;
}

const getTabs = (langPrefix: string): TabItem[] => [
  { id: "home", icon: Home, path: `${langPrefix}/feed` },
  { id: "search", icon: Search, path: `${langPrefix}/friends` },
  { id: "create", icon: PlusSquare, path: `${langPrefix}/editor` },
  { id: "activity", icon: Heart, path: `${langPrefix}/contacts` },
  { id: "profile", icon: User, path: `${langPrefix}/dashboard` },
];

const INDICATOR_W = 44;
const INDICATOR_H = 40;

export const TabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const langPrefix = `/${language}`;
  const tabs = getTabs(langPrefix);

  const getActiveTab = () => {
    const path = location.pathname;
    const found = tabs.find((t) => path.startsWith(t.path));
    return found?.id || "home";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [tabCenters, setTabCenters] = useState<number[]>([]);

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 700, damping: 40 });
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const springScaleX = useSpring(scaleX, { stiffness: 400, damping: 15 });
  const springScaleY = useSpring(scaleY, { stiffness: 400, damping: 15 });

  const lastX = useRef(0);
  const lastT = useRef(0);

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  // Measure each tab's center relative to the container.
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      const centers = tabRefs.current.map((el) => {
        if (!el) return 0;
        const r = el.getBoundingClientRect();
        return r.left - cRect.left + r.width / 2;
      });
      setTabCenters(centers);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Snap indicator to the active tab's center when not dragging.
  useEffect(() => {
    if (isDragging) return;
    const c = tabCenters[activeIndex];
    if (c == null || c === 0) return;
    x.set(c - INDICATOR_W / 2);
  }, [activeIndex, isDragging, tabCenters, x]);

  const isAnonymousUser = !user && localStorage.getItem("anonymous-session") === "true";
  if (!user && !isAnonymousUser) return null;

  const setFromClientX = (clientX: number) => {
    if (!containerRef.current || !tabCenters.length) return;
    const rect = containerRef.current.getBoundingClientRect();
    const local = clientX - rect.left;
    const max = rect.width - INDICATOR_W;
    x.set(Math.max(0, Math.min(local - INDICATOR_W / 2, max)));
  };

  const wobble = (clientX: number) => {
    const now = performance.now();
    const dt = Math.max(1, now - lastT.current);
    const v = (clientX - lastX.current) / dt;
    const f = Math.min(Math.abs(v) * 2.4, 0.8);
    scaleX.set(1.2 + f);
    scaleY.set(0.8 - f * 0.4);
    lastX.current = clientX;
    lastT.current = now;
  };

  const snap = () => {
    if (!tabCenters.length) return;
    const indicatorCenter = x.get() + INDICATOR_W / 2;
    let bestIdx = 0;
    let bestDist = Infinity;
    tabCenters.forEach((c, i) => {
      const d = Math.abs(c - indicatorCenter);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    const tab = tabs[bestIdx];
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto w-full max-w-sm z-50 px-4 animate-fade-in-up">
      <div
        ref={containerRef}
        className="relative w-full h-14 rounded-full pill-container touch-none overflow-hidden"
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          setIsDragging(true);
          scaleX.set(1.3);
          scaleY.set(0.7);
          lastX.current = e.clientX;
          lastT.current = performance.now();
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!isDragging) return;
          setFromClientX(e.clientX);
          wobble(e.clientX);
        }}
        onPointerUp={() => {
          setIsDragging(false);
          scaleX.set(1);
          scaleY.set(1);
          snap();
        }}
        onPointerCancel={() => {
          setIsDragging(false);
          scaleX.set(1);
          scaleY.set(1);
          snap();
        }}
      >
        {/* Indicator pill */}
        <motion.div
          className={`absolute rounded-full z-10 top-1/2 ${
            isDragging ? "pill-indicator-dragging" : "pill-indicator"
          }`}
          style={{
            width: INDICATOR_W,
            height: INDICATOR_H,
            left: 0,
            x: springX,
            y: "-50%",
            scaleX: springScaleX,
            scaleY: springScaleY,
          }}
        />

        {/* Tab buttons */}
        <div className="absolute inset-0 flex items-center z-20">
          {tabs.map((t, i) => {
            const Icon = t.icon;
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                ref={(el) => (tabRefs.current[i] = el)}
                type="button"
                className="flex-1 h-full flex items-center justify-center"
                onClick={(e) => {
                  // Click is fine since pointerup also navigates; allow keyboard
                  e.preventDefault();
                }}
              >
                <Icon
                  className={`transition-colors duration-200 ${
                    active ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                  size={22}
                  strokeWidth={active ? 2.5 : 1.75}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabBar;
