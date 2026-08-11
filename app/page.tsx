"use client";

import { useMemo, useState } from "react";

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
];

const categories = ["전체", "한식", "일식", "양식", "건강식"];

export default function Home() {
  const [category, setCategory] = useState("전체");
  const [picked, setPicked] = useState<Menu>(menus[0]);
  const filtered = useMemo(() => category === "전체" ? menus : menus.filter((menu) => menu.category === category), [category]);

  const pickRandom = () => {
    const pool = filtered.length ? filtered : menus;
    setPicked(pool[Math.floor(Math.random() * pool.length)]);
  };

  return (
    <main className="site-shell">
      <nav className="nav container">
        <a className="brand" href="#top"><span className="brand-mark">✦</span><span>오늘 뭐 먹지?</span></a>
        <div className="nav-links"><a href="#recommend">추천 메뉴</a><a href="#how">이용 방법</a></div>
        <button className="saved-button" aria-label="찜한 메뉴 보기">♡ <span>찜한 메뉴</span></button>
      </nav>

      <section className="hero container" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span /> 오늘의 점심 큐레이터</div>
          <h1>점심 메뉴,<br /><em>3초면 충분해요.</em></h1>
          <p>매일 반복되는 고민은 가볍게 덜어내고,<br />오늘 나에게 딱 맞는 한 끼를 찾아보세요.</p>
          <div className="hero-actions"><button className="primary-button" onClick={pickRandom}>랜덤으로 골라줘 <span>↗</span></button><button className="text-button" onClick={() => document.getElementById("recommend")?.scrollIntoView({ behavior: "smooth" })}>메뉴 둘러보기 <span>↓</span></button></div>
          <div className="social-proof"><div className="avatars"><span>J</span><span>M</span><span>S</span><span>+</span></div><div><strong>12,840명</strong>이 오늘도 골랐어요</div></div>
        </div>
        <div className="hero-note"><span>TIP</span><p>월요일엔<br /><strong>따뜻한 국물</strong>이<br />잘 어울려요.</p><i>〰</i></div>
      </section>

      <section className="recommend-section" id="recommend"><div className="container">
        <div className="section-heading"><div><div className="eyebrow"><span /> CURATED FOR YOU</div><h2>오늘의 추천 메뉴</h2></div><div className="date-stamp">2026. 08. 11 <span>화요일</span></div></div>
        <div className="category-bar">{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}<div className="filter-meta"><span>지금 가장 인기 있는 메뉴</span><span className="pulse-dot" /></div></div>
        <div className="content-grid"><div className="menu-list">{filtered.slice(0, 4).map((menu, index) => <article className={`menu-card ${index === 0 ? "featured" : ""}`} key={menu.name} onClick={() => setPicked(menu)}><div className={`food-visual ${menu.accent}`}><span>{menu.emoji}</span>{index === 0 && <b>BEST</b>}</div><div className="menu-info"><div className="menu-top"><span className="tag">{menu.category}</span><span className="heart">♡</span></div><h3>{menu.name}</h3><p>{menu.description}</p><div className="menu-bottom"><strong>{menu.price}</strong><span>⏱ {menu.time}</span><span>★ {menu.rating}</span></div></div></article>)}</div>
          <aside className="decision-card"><div className="decision-kicker">STILL CAN&apos;T DECIDE?</div><h3>오늘은<br /><em>제가 고를게요.</em></h3><div className="picked-food">{picked.emoji}</div><div className="picked-label">오늘의 선택</div><div className="picked-name">{picked.name}</div><div className="picked-details">{picked.category} · {picked.price}</div><button className="secondary-button" onClick={pickRandom}>다시 뽑기 <span>↻</span></button><div className="scribble">고민은<br />여기까지!</div></aside>
        </div>
      </div></section>
      <section className="how container" id="how"><div className="eyebrow"><span /> HOW IT WORKS</div><h2>고민은 줄이고, 점심은 더 맛있게.</h2><div className="steps"><div><b>01</b><strong>취향을 골라요</strong><p>오늘 당기는 카테고리를 선택하세요.</p></div><div><b>02</b><strong>메뉴를 발견해요</strong><p>검증된 메뉴 중 하나를 만나보세요.</p></div><div><b>03</b><strong>맛있게 먹어요</strong><p>오후의 에너지를 충전하세요.</p></div></div></section>
      <footer className="footer container"><span>© 2026 오늘 뭐 먹지?</span><span>당신의 점심을 응원합니다 ◡̈</span></footer>
    </main>
  );
}
