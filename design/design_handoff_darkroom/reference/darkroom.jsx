/* Direction B — Contact Sheet / Darkroom
   Photographer × developer crossover. Dark, grainy, monospace.
   Frame-numbered cells like film, terminal column, safelight + lime. */

const DarkroomArtboard = () => {
  const [cursor, setCursor] = React.useState({ x: -100, y: -100, on: false });
  const ref = React.useRef(null);

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setCursor({ x: e.clientX - r.left, y: e.clientY - r.top, on: true });
  };

  const frames = [
    { k: 'photo', tone: 'a', label: 'TEMPELHOF · 18:42', tag: 'PORTRA 400' },
    { k: 'code',  text: 'export default function Page() {\n  return <Studio />;\n}', tag: 'ASTRO 5' },
    { k: 'photo', tone: 'b', label: 'BOSPORUS · 07:11', tag: '35MM' },
    { k: 'paint', tone: 'c', label: 'POMEGRANATES · STUDIO', tag: 'OIL · 50×40' },
    { k: 'photo', tone: 'd', label: 'KREUZBERG · NIGHT', tag: 'TRI-X 400' },
    { k: 'code',  text: '$ pnpm build\n  ✓ 22 pages\n  ✓ 0 warnings', tag: 'BUILD OK' },
    { k: 'photo', tone: 'e', label: 'STUDIO · NORTH LIGHT', tag: '120MM' },
    { k: 'paint', tone: 'f', label: 'AFTER BONNARD', tag: 'GOUACHE' },
    { k: 'photo', tone: 'g', label: 'U-BAHN · 23:54', tag: 'PUSHED +1' },
  ];

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={() => setCursor(c => ({ ...c, on: false }))}
         style={darkStyles.root}>
      {/* grain */}
      <div style={darkStyles.grain} />
      {/* reticle cursor */}
      <div style={{
        ...darkStyles.reticle,
        opacity: cursor.on ? 1 : 0,
        transform: `translate(${cursor.x - 18}px, ${cursor.y - 18}px)`,
      }}>
        <div style={darkStyles.ret_h} />
        <div style={darkStyles.ret_v} />
        <div style={darkStyles.ret_c} />
      </div>

      {/* terminal header bar */}
      <header style={darkStyles.bar}>
        <span style={darkStyles.bar_dot} />
        <span style={darkStyles.bar_user}>ercan@darkroom</span>
        <span style={darkStyles.bar_dim}>:</span>
        <span style={darkStyles.bar_path}>~/portfolio</span>
        <span style={darkStyles.bar_dim}>$</span>
        <span style={darkStyles.bar_cmd}>./develop --contact-sheet 2026</span>
        <span style={darkStyles.bar_spacer} />
        <span style={darkStyles.bar_meta}>BERLIN · 12049</span>
        <span style={darkStyles.bar_meta}>11.V.26 · 21:14</span>
        <span style={darkStyles.bar_rec}>● REC</span>
      </header>

      {/* hero */}
      <section style={darkStyles.hero}>
        <div style={darkStyles.hero_left}>
          <div style={darkStyles.hero_meta}>ROLL 12 · F/2.8 · 1/250 · ISO 400</div>
          <h1 style={darkStyles.hero_h}>
            <span style={darkStyles.hero_lg}>ercan</span>
            <span style={darkStyles.hero_lg}>atak</span>
            <span style={darkStyles.hero_dim}>// dev · photog · painter</span>
          </h1>
          <p style={darkStyles.hero_p}>
            I keep three darkrooms: one for software, one for film, one for paint.
            Below is the latest contact sheet — frames as they came back, unranked.
            Click any cell to enlarge.
          </p>
          <div style={darkStyles.hero_nav}>
            {['home', 'sheet', 'journal', 'rolls', 'paints', 'reach'].map((n,i) => (
              <span key={n} style={darkStyles.hero_navi}>
                <em style={darkStyles.hero_navN}>{String(i+1).padStart(2,'0')}</em>{n}
              </span>
            ))}
          </div>
        </div>

        {/* terminal column */}
        <div style={darkStyles.term}>
          <div style={darkStyles.term_head}>~/journal/feed.sh</div>
          <pre style={darkStyles.term_pre}>
<span style={darkStyles.term_p}>$</span> cat ~/blog/*.mdx | head{'\n'}
<span style={darkStyles.term_g}>▸ 2026-03-10</span>  building modern web apps{'\n'}
<span style={darkStyles.term_g}>▸ 2026-02-20</span>  typescript, with patience{'\n'}
<span style={darkStyles.term_g}>▸ 2026-01-15</span>  getting started with astro{'\n'}
<span style={darkStyles.term_p}>$</span> whoami{'\n'}
ercan — full-stack, half-painter,{'\n'}
        based in Kreuzberg{'\n'}
<span style={darkStyles.term_p}>$</span> uptime{'\n'}
Berlin, since 2014 — load avg 0.7{'\n'}
<span style={darkStyles.term_p}>$</span> <span style={darkStyles.term_blink}>_</span>
          </pre>
        </div>
      </section>

      {/* sprocket band */}
      <div style={darkStyles.sprocketRow}>
        {Array.from({ length: 18 }).map((_, i) => <div key={i} style={darkStyles.sprocket} />)}
      </div>

      {/* contact sheet */}
      <section style={darkStyles.sheet}>
        {frames.map((f, i) => (
          <article key={i} style={darkStyles.frame}>
            <div style={darkStyles.frame_num}>{String(i+1).padStart(2,'0')}A</div>
            {f.k === 'photo' && (
              <div style={{ ...darkStyles.frame_img, ...darkPhotoBg(f.tone) }}>
                <div style={darkStyles.frame_tag}>{f.tag}</div>
                <div style={darkStyles.frame_label}>{f.label}</div>
              </div>
            )}
            {f.k === 'paint' && (
              <div style={{ ...darkStyles.frame_img, ...darkPaintBg(f.tone) }}>
                <div style={{ ...darkStyles.frame_tag, color: '#ff3b30', borderColor: '#ff3b30' }}>{f.tag}</div>
                <div style={darkStyles.frame_label}>{f.label}</div>
              </div>
            )}
            {f.k === 'code' && (
              <div style={darkStyles.frame_code}>
                <div style={{ ...darkStyles.frame_tag, color: '#d4ff3a', borderColor: '#d4ff3a' }}>{f.tag}</div>
                <pre style={darkStyles.frame_pre}>{f.text}</pre>
              </div>
            )}
          </article>
        ))}
      </section>
      <div style={darkStyles.sprocketRow}>
        {Array.from({ length: 18 }).map((_, i) => <div key={i} style={darkStyles.sprocket} />)}
      </div>

      {/* exif strip */}
      <section style={darkStyles.exifWrap}>
        <h2 style={darkStyles.exifH}>// EXIF — work that paid the rent</h2>
        <div style={darkStyles.exifGrid}>
          {[
            { t: 'MaHalle', sub: 'Home-made Facebook for the Kiez',
              exif: ['STACK · Next.js + Mongo', 'YEAR · 2024', 'STATUS · live'] },
            { t: 'Dogs & Films', sub: 'A catalogue, two obsessions',
              exif: ['STACK · Next.js + Tailwind', 'YEAR · 2023', 'STATUS · live'] },
            { t: 'Quiet Dashboard', sub: 'Admin, restrained',
              exif: ['STACK · Next.js + Sass', 'YEAR · 2023', 'STATUS · archived'] },
          ].map((p, i) => (
            <div key={i} style={darkStyles.exifCard}>
              <div style={darkStyles.exifNum}>0{i+1}/03</div>
              <div style={darkStyles.exifTitle}>{p.t}</div>
              <div style={darkStyles.exifSub}>{p.sub}</div>
              <div style={darkStyles.exifList}>
                {p.exif.map((e,j) => <div key={j} style={darkStyles.exifLine}>{e}</div>)}
              </div>
              <div style={darkStyles.exifLink}>open frame →</div>
            </div>
          ))}
        </div>
      </section>

      {/* footer */}
      <footer style={darkStyles.foot}>
        <span style={darkStyles.foot_l}>FRAME 36/36 — END OF ROLL</span>
        <span style={darkStyles.foot_c}>atakee@gmail.com  ·  +49 30 88694300  ·  12049 Berlin</span>
        <span style={darkStyles.foot_r}>© ATAK · 2026</span>
      </footer>
    </div>
  );
};

const darkPhotoBg = (tone) => {
  const map = {
    a: 'radial-gradient(120% 80% at 30% 70%, #5a4a32 0%, #1a1815 60%, #0a0908 100%)',
    b: 'linear-gradient(180deg, #3a4d52 0%, #1a2227 70%, #0a0e10 100%)',
    d: 'radial-gradient(100% 60% at 50% 100%, #6a2a2e 0%, #1a0d0e 60%, #08070a 100%)',
    e: 'linear-gradient(180deg, #2a2a28 0%, #4a4845 50%, #1a1816 100%)',
    g: 'linear-gradient(180deg, #1a1815 0%, #2a2520 50%, #0a0908 100%)',
  };
  return { background: map[tone] || map.a };
};
const darkPaintBg = (tone) => {
  const map = {
    c: 'radial-gradient(60% 50% at 50% 60%, #c8332a 0%, #5a1814 60%, #1a0807 100%)',
    f: 'linear-gradient(160deg, #c4a76b 0%, #6e5a3a 60%, #2a2316 100%)',
  };
  return { background: map[tone] || map.c };
};

const darkStyles = {
  root: {
    position: 'relative',
    width: '100%',
    minHeight: '100%',
    background: '#0d0d0c',
    color: '#e8e5dd',
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    fontSize: 13,
    lineHeight: 1.5,
    padding: '24px 36px 36px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    cursor: 'crosshair',
  },
  grain: {
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
    backgroundImage:
      'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),' +
      'radial-gradient(rgba(0,0,0,0.4) 1px, transparent 1px)',
    backgroundSize: '3px 3px, 4px 4px',
    mixBlendMode: 'overlay',
  },
  reticle: {
    position: 'absolute', width: 36, height: 36, zIndex: 50, pointerEvents: 'none',
    transition: 'opacity 120ms',
  },
  ret_h: { position: 'absolute', top: 17, left: 0, right: 0, height: 1, background: '#ff3b30' },
  ret_v: { position: 'absolute', left: 17, top: 0, bottom: 0, width: 1, background: '#ff3b30' },
  ret_c: { position: 'absolute', top: 16, left: 16, width: 4, height: 4, border: '1px solid #ff3b30', borderRadius: '50%' },

  bar: {
    position: 'relative', zIndex: 2,
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px',
    background: '#18181a',
    border: '1px solid #2a2a28',
    fontSize: 11,
    letterSpacing: '0.04em',
  },
  bar_dot: { width: 8, height: 8, background: '#d4ff3a', borderRadius: '50%' },
  bar_user: { color: '#d4ff3a' },
  bar_dim: { color: '#6a6a66' },
  bar_path: { color: '#9a9a92' },
  bar_cmd: { color: '#e8e5dd' },
  bar_spacer: { flex: 1 },
  bar_meta: { color: '#9a9a92', letterSpacing: '0.12em' },
  bar_rec: { color: '#ff3b30', letterSpacing: '0.16em', fontWeight: 700 },

  hero: {
    position: 'relative', zIndex: 2,
    display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32,
    padding: '36px 0 28px',
  },
  hero_left: {},
  hero_meta: { fontSize: 11, color: '#9a9a92', letterSpacing: '0.16em', marginBottom: 22 },
  hero_h: { margin: 0, display: 'flex', flexDirection: 'column', gap: 0, lineHeight: 0.88 },
  hero_lg: {
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    fontWeight: 700, fontSize: 124, letterSpacing: '-0.04em',
    color: '#f4f1ea',
  },
  hero_dim: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13, color: '#d4ff3a', fontWeight: 400, letterSpacing: '0.08em',
    marginTop: 16, fontStyle: 'normal',
  },
  hero_p: { maxWidth: 500, fontSize: 13, color: '#c2bfb6', marginTop: 26, lineHeight: 1.6 },
  hero_nav: { display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 28 },
  hero_navi: { fontSize: 12, color: '#e8e5dd', textTransform: 'uppercase', letterSpacing: '0.14em' },
  hero_navN: { color: '#ff3b30', fontStyle: 'normal', marginRight: 6, fontSize: 10 },

  term: { background: '#18181a', border: '1px solid #2a2a28', padding: '14px 16px' },
  term_head: {
    fontSize: 10, color: '#9a9a92', letterSpacing: '0.18em',
    paddingBottom: 10, borderBottom: '1px solid #2a2a28', marginBottom: 12, textTransform: 'uppercase',
  },
  term_pre: { margin: 0, fontSize: 12, lineHeight: 1.7, color: '#e8e5dd', whiteSpace: 'pre-wrap' },
  term_p: { color: '#ff3b30' },
  term_g: { color: '#d4ff3a' },
  term_blink: { display: 'inline-block', width: 8, height: 14, background: '#d4ff3a', verticalAlign: '-2px', animation: 'darkBlink 1s steps(2) infinite' },

  sprocketRow: {
    position: 'relative', zIndex: 2,
    display: 'flex', gap: 0, justifyContent: 'space-between',
    margin: '10px 0',
    padding: '6px 0',
    background: '#18181a',
  },
  sprocket: { width: 28, height: 12, background: '#0d0d0c', borderRadius: 2 },

  sheet: {
    position: 'relative', zIndex: 2,
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
    background: '#18181a', padding: 10, border: '1px solid #2a2a28',
  },
  frame: { position: 'relative', aspectRatio: '4/3', border: '1px solid #2a2a28', overflow: 'hidden' },
  frame_num: {
    position: 'absolute', top: 6, left: 6, zIndex: 3,
    fontSize: 10, color: '#d4ff3a', letterSpacing: '0.12em',
    background: 'rgba(0,0,0,0.6)', padding: '2px 5px',
  },
  frame_img: { position: 'absolute', inset: 0 },
  frame_tag: {
    position: 'absolute', top: 6, right: 6,
    fontSize: 9, letterSpacing: '0.14em',
    color: '#e8e5dd', border: '1px solid #e8e5dd',
    padding: '2px 5px', background: 'rgba(0,0,0,0.5)',
  },
  frame_label: {
    position: 'absolute', left: 8, bottom: 8,
    fontSize: 10, letterSpacing: '0.16em', color: '#e8e5dd',
  },
  frame_code: { position: 'absolute', inset: 0, background: '#0a0a09', padding: '24px 14px 14px' },
  frame_pre: { margin: 0, fontSize: 11, color: '#d4ff3a', lineHeight: 1.5, whiteSpace: 'pre-wrap' },

  exifWrap: { position: 'relative', zIndex: 2, marginTop: 28 },
  exifH: {
    margin: 0, fontSize: 13, color: '#9a9a92', letterSpacing: '0.18em',
    textTransform: 'uppercase', marginBottom: 16,
  },
  exifGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  exifCard: {
    border: '1px solid #2a2a28', background: '#18181a',
    padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 4,
  },
  exifNum: { fontSize: 10, color: '#ff3b30', letterSpacing: '0.18em' },
  exifTitle: {
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    fontSize: 26, fontWeight: 700, color: '#f4f1ea', marginTop: 8, letterSpacing: '-0.02em',
  },
  exifSub: { fontSize: 12, color: '#c2bfb6', marginBottom: 12 },
  exifList: {
    borderTop: '1px dashed #2a2a28', borderBottom: '1px dashed #2a2a28',
    padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 4,
  },
  exifLine: { fontSize: 10, color: '#9a9a92', letterSpacing: '0.1em' },
  exifLink: { fontSize: 11, color: '#d4ff3a', letterSpacing: '0.12em', marginTop: 10, textTransform: 'uppercase' },

  foot: {
    position: 'relative', zIndex: 2,
    marginTop: 22, paddingTop: 14, borderTop: '1px solid #2a2a28',
    display: 'flex', justifyContent: 'space-between',
    fontSize: 10, color: '#6a6a66', letterSpacing: '0.16em',
  },
  foot_l: { color: '#ff3b30' },
  foot_c: {},
  foot_r: {},
};

// inject keyframes
if (typeof document !== 'undefined' && !document.getElementById('darkroom-kf')) {
  const s = document.createElement('style');
  s.id = 'darkroom-kf';
  s.textContent = '@keyframes darkBlink { to { opacity: 0; } }';
  document.head.appendChild(s);
}

window.DarkroomArtboard = DarkroomArtboard;
