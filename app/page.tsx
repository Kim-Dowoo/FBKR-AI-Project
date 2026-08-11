"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type Menu = {
  name: string;
  category: string;
  price: string;
  time: string;
  rating: string;
  description: string;
  emoji: string;
  accent: string;
};

const menus: Menu[] = [
  { name: "제육볶음", category: "한식", price: "₩9,000", time: "10분", rating: "4.8", description: "오늘은 매콤달콤하게, 밥 한 공기 뚝딱", emoji: "🥘", accent: "rose" },
  { name: "치킨 샐러드", category: "건강식", price: "₩11,500", time: "15분", rating: "4.6", description: "오후까지 가볍고 든든하게", emoji: "🥗", accent: "mint" },
  { name: "돈코츠 라멘", category: "일식", price: "₩10,000", time: "12분", rating: "4.7", description: "진한 국물이 필요한 날의 정답", emoji: "🍜", accent: "yellow" },
  { name: "트러플 머쉬룸 파스타", category: "양식", price: "₩13,500", time: "18분", rating: "4.5", description: "기분 전환이 필요한 수요일", emoji: "🍝", accent: "blue" },
  { name: "김치찌개", category: "한식", price: "₩8,500", time: "8분", rating: "4.9", description: "익숙해서 더 좋은 따뜻한 한 끼", emoji: "🍲", accent: "orange" },
  { name: "새우 아보카도 덮밥", category: "건강식", price: "₩12,000", time: "10분", rating: "4.4", description: "바쁜 날에도 깔끔하게 채우기", emoji: "🍤", accent: "purple" },
  { name: "치즈 돈까스", category: "일식", price: "₩12,500", time: "14분", rating: "4.7", description: "바삭한 한입에 오후 기분까지 상승", emoji: "🍛", accent: "rose" },
  { name: "마라탕", category: "중식", price: "₩11,000", time: "16분", rating: "4.6", description: "스트레스까지 얼얼하게 날려주는 맛", emoji: "🌶️", accent: "orange" },
  { name: "소고기 비빔밥", category: "한식", price: "₩10,500", time: "11분", rating: "4.8", description: "알록달록 든든하게 채우는 한 그릇", emoji: "🍚", accent: "mint" },
  { name: "토마토 바질 샌드위치", category: "양식", price: "₩9,500", time: "7분", rating: "4.3", description: "회의 많은 날 빠르게 먹기 좋은 메뉴", emoji: "🥪", accent: "blue" },
  { name: "떡볶이 세트", category: "분식", price: "₩8,000", time: "9분", rating: "4.7", description: "매콤달콤한 행복과 김밥 한 줄", emoji: "🍢", accent: "yellow" },
  { name: "쌀국수", category: "아시안", price: "₩10,000", time: "13분", rating: "4.5", description: "속이 편안해지는 담백한 국물 한 그릇", emoji: "🍜", accent: "purple" },
];

const categories = ["전체", "한식", "일식", "양식", "건강식", "중식", "분식", "아시안"];

export default function Home() {
  const [category, setCategory] = useState("전체");
  const [picked, setPicked] = useState<Menu>(menus[0]);
  const [favoriteCounts, setFavoriteCounts] = useState<Record<string, number>>({});
  const [likedMenus, setLikedMenus] = useState<Record<string, boolean>>({});
  const [savingMenu, setSavingMenu] = useState<string | null>(null);
  const [savedOpen, setSavedOpen] = useState(false);
  const filtered = useMemo(() => category === "전체" ? menus : menus.filter((menu) => menu.category === category), [category]);
  const savedMenus = menus.filter((menu) => likedMenus[menu.name]);

  const getVisitorId = () => {
    const storageKey = "oneul-mwo-meokji-visitor";
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.localStorage.setItem(storageKey, next);
    return next;
  };

  const refreshFavoriteCounts = async () => {
    if (!supabase) return;
    const results = await Promise.all(menus.map(async (menu) => {
      const { count, error } = await supabase.from("menu_favorites").select("menu_name", { count: "exact", head: true }).eq("menu_name", menu.name);
      return error ? null : [menu.name, count ?? 0] as const;
    }));
    setFavoriteCounts(Object.fromEntries(results.filter((result): result is readonly [string, number] => result !== null)));
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("oneul-mwo-meokji-liked");
    if (saved) setLikedMenus(JSON.parse(saved) as Record<string, boolean>);
    void refreshFavoriteCounts();
  }, []);

  const toggleFavorite = async (menu: Menu) => {
    if (!supabase || savingMenu) return;
    setSavingMenu(menu.name);
    const visitorId = getVisitorId();
    const isLiked = Boolean(likedMenus[menu.name]);
    const result = isLiked
      ? await supabase.from("menu_favorites").delete().eq("menu_name", menu.name).eq("visitor_id", visitorId)
      : await supabase.from("menu_favorites").insert({ menu_name: menu.name, visitor_id: visitorId });

    if (!result.error || (!isLiked && result.error.code === "23505")) {
      const nextLiked = { ...likedMenus, [menu.name]: !isLiked };
      setLikedMenus(nextLiked);
      window.localStorage.setItem("oneul-mwo-meokji-liked", JSON.stringify(nextLiked));
      setFavoriteCounts((current) => ({ ...current, [menu.name]: Math.max(0, (current[menu.name] ?? 0) + (isLiked ? -1 : result.error ? 0 : 1)) }));
    }
    setSavingMenu(null);
  };

  const pickRandom = () => {
    const pool = filtered.length ? filtered : menus;
    setPicked(pool[Math.floor(Math.random() * pool.length)]);
  };

  return (
    <main className="site-shell">
      <nav className="nav container">
        <a className="brand" href="#top"><span className="brand-mark">✦</span><span>오늘 뭐 먹지?</span></a>
        <div className="nav-links"><a href="#recommend">추천 메뉴</a><a href="#how">이용 방법</a></div>
        <div style={{ position: "relative" }}>
          <button className="saved-button" aria-expanded={savedOpen} onClick={() => setSavedOpen((open) => !open)}>♡ <span>찜한 메뉴{savedMenus.length ? ` (${savedMenus.length})` : ""}</span></button>
          {savedOpen && <div style={{ position: "absolute", right: 0, top: "calc(100% + 12px)", zIndex: 10, width: 250, padding: 16, background: "#fffdf9", border: "1px solid #e9e3da", borderRadius: 6, boxShadow: "0 15px 35px #1923371c" }}>
            <div style={{ font: "11px 'DM Mono'", color: "#9a8d82", marginBottom: 12 }}>MY FAVORITES</div>
            {savedMenus.length === 0 ? <p style={{ margin: 0, color: "#969ba3", fontSize: 12 }}>아직 찜한 메뉴가 없어요.</p> : savedMenus.map((menu) => <button key={menu.name} onClick={() => { setPicked(menu); setSavedOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "8px 0", background: "transparent", textAlign: "left", fontSize: 13 }}><span>{menu.emoji}</span><span>{menu.name}</span><span style={{ marginLeft: "auto", color: "#ff765f", fontSize: 11 }}>♥ {favoriteCounts[menu.name] ?? 0}</span></button>)}
          </div>}
        </div>
      </nav>

      <section className="hero container" id="top">
        <div className="hero-copy"><div className="eyebrow"><span /> 오늘의 점심 큐레이터</div><h1>점심 메뉴,<br /><em>5초면 충분해요.</em></h1><p>매일 반복되는 고민은 가볍게 덜어내고,<br />오늘 나에게 딱 맞는 맛있는 한 끼를 찾아보세요.</p><div className="hero-actions"><button className="primary-button" onClick={pickRandom}>랜덤으로 골라줘 <span>↗</span></button><button className="text-button" onClick={() => document.getElementById("recommend")?.scrollIntoView({ behavior: "smooth" })}>메뉴 둘러보기 <span>↓</span></button></div><div className="social-proof"><div className="avatars"><span>J</span><span>M</span><span>S</span><span>+</span></div><div><strong>12,840명</strong>이 오늘도 골랐어요</div></div></div>
        <div className="hero-note"><span>TIP</span><p>월요일엔<br /><strong>따뜻한 국물</strong>이<br />잘 어울려요.</p><i>〰</i></div>
      </section>

      <section className="recommend-section" id="recommend"><div className="container"><div className="section-heading"><div><div className="eyebrow"><span /> CURATED FOR YOU</div><h2>오늘의 추천 메뉴</h2></div><div className="date-stamp">2026. 08. 11 <span>화요일</span></div></div><div className="category-bar">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}<div className="filter-meta"><span>지금 가장 인기 있는 메뉴</span><span className="pulse-dot" /></div></div><div className="content-grid"><div className="menu-list">{filtered.map((menu, index) => <article className={`menu-card ${index === 0 ? "featured" : ""}`} key={menu.name} onClick={() => setPicked(menu)}><div className={`food-visual ${menu.accent}`}><span>{menu.emoji}</span>{index === 0 && <b>BEST</b>}</div><div className="menu-info"><div className="menu-top"><span className="tag">{menu.category}</span><button className="heart" style={{ color: likedMenus[menu.name] ? "var(--coral)" : undefined }} aria-label={`${menu.name} 찜하기`} onClick={(event) => { event.stopPropagation(); void toggleFavorite(menu); }}>{likedMenus[menu.name] ? "♥" : "♡"} <small>{favoriteCounts[menu.name] ?? 0}</small></button></div><h3>{menu.name}</h3><p>{menu.description}</p><div className="menu-bottom"><strong>{menu.price}</strong><span>⏱ {menu.time}</span><span>★ {menu.rating}</span></div></div></article>)}</div><aside className="decision-card"><div className="decision-kicker">STILL CAN&apos;T DECIDE?</div><h3>오늘은<br /><em>제가 고를게요.</em></h3><div className="picked-food">{picked.emoji}</div><div className="picked-label">오늘의 선택</div><div className="picked-name">{picked.name}</div><div className="picked-details">{picked.category} · {picked.price}</div><button className="secondary-button" onClick={pickRandom}>다시 뽑기 <span>↻</span></button><div className="scribble">고민은<br />여기까지!</div></aside></div></div></section>
      <section className="how container" id="how"><div className="eyebrow"><span /> HOW IT WORKS</div><h2>고민은 줄이고, 점심은 더 맛있게.</h2><div className="steps"><div><b>01</b><strong>취향을 골라요</strong><p>오늘 당기는 카테고리를 선택하세요.</p></div><div><b>02</b><strong>메뉴를 발견해요</strong><p>검증된 메뉴 중 하나를 만나보세요.</p></div><div><b>03</b><strong>맛있게 먹어요</strong><p>오후의 에너지를 충전하세요.</p></div></div></section>
      <footer className="footer container"><span>© 2026 오늘 뭐 먹지?</span><span>당신의 점심을 응원합니다 ◡̈</span></footer>
    </main>
  );
}
