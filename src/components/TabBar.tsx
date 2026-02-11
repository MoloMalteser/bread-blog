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

export const TabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();
  const langPrefix = `/${language}`;
  const tabs = getTabs(langPrefix);

  const getActiveTab = () => {
    const path = location.pathname;
    const found = tabs.find(t => path.startsWith(t.path));
    return found?.id || "home";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);

  const indicatorWidth = 44;
  const indicatorHeight = 36;
  const tabWidth = width / tabs.length;
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  const x = useMotionValue(activeIndex * tabWidth + tabWidth / 2 - indicatorWidth / 2);
  const springX = useSpring(x, { stiffness: 800, damping: 45 });
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const springScaleX = useSpring(scaleX, { stiffness: 400, damping: 15 });
  const springScaleY = useSpring(scaleY, { stiffness: 400, damping: 15 });

  const lastX = useRef(0);
  const lastT = useRef(0);

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => setWidth(containerRef.current!.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!isDragging) {
      x.set(activeIndex * tabWidth + tabWidth / 2 - indicatorWidth / 2);
    }
  }, [activeIndex, isDragging, tabWidth, x]);

  const isAnonymousUser = !user && localStorage.getItem('anonymous-session') === 'true';
  if (!user && !isAnonymousUser) return null;

  const setFromClientX = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const local = clientX - rect.left;
    const max = width - indicatorWidth;
    x.set(Math.max(0, Math.min(local - indicatorWidth / 2, max)));
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
    const current = x.get();
    const index = Math.round((current + indicatorWidth / 2 - tabWidth / 2) / tabWidth);
    const tab = tabs[Math.max(0, Math.min(index, tabs.length - 1))];
    setActiveTab(tab.id);
    navigate(tab.path);
  };

  return (
    <div className="fixed bottom-6 inset-x-0 mx-auto w-full max-w-sm z-50 px-4 animate-fade-in-up">
      <div
        ref={containerRef}
        className="relative w-full h-14 rounded-full pill-container touch-none overflow-hidden flex items-center"
        onPointerDown={(e) => {
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
        <motion.div
          className={`absolute rounded-full z-40 ${isDragging ? "pill-indicator-dragging" : "pill-indicator"}`}
          style={{
            width: indicatorWidth,
            height: indicatorHeight,
            left: 0,
            top: "50%",
            y: "-50%",
            x: springX,
            scaleX: springScaleX,
            scaleY: springScaleY,
            originY: "center",
          }}
        />

        <div className="absolute inset-0 grid grid-cols-5 z-50 pointer-events-none items-center">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = t.id === activeTab;
            return (
              <div key={t.id} className="flex justify-center items-center">
                <Icon
                  className={`transition-colors duration-200 ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
                  size={22}
                  strokeWidth={active ? 2.5 : 1.5}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabBar;
