/* eslint-disable */
/* Additional Darkroom screens for the handoff preview.
 *
 *   - DarkroomEnlargedFrame  → the click-to-expand modal view of a contact-sheet cell
 *   - DarkroomBlogPost       → an article detail page (typography sample for MDX)
 *   - DarkroomMobile         → the homepage collapsed to ~390 px wide
 *
 *   These render in design_handoff_darkroom/reference/darkroom-preview.html
 *   so reviewers can see more than just the homepage.
 *
 *   Styles are inlined (not shared with darkroom.jsx) so each screen is
 *   self-contained — easier to read alongside the main prototype.
 */

/* -------------------------------------------------------------------------- */
/*  Shared design tokens (same hex codes as darkStyles)                       */
/* -------------------------------------------------------------------------- */
const C = {
  ink:      '#0d0d0c',
  ink2:     '#18181a',
  ink3:     '#2a2a28',
  mute:     '#6a6a66',
  mute2:    '#9a9a92',
  paper2:   '#c2bfb6',
  paper:    '#e8e5dd',
  paperHi:  '#f4f1ea',
  safelight:'#ff3b30',
  phosphor: '#d4ff3a',
};
const F = {
  mono:    '"JetBrains Mono", ui-monospace, monospace',
  display: '"Space Grotesk", "Inter", sans-serif',
};

const grainOverlay = {
  position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
  backgroundImage:
    'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),' +
    'radial-gradient(rgba(0,0,0,0.4) 1px, transparent 1px)',
  backgroundSize: '3px 3px, 4px 4px',
  mixBlendMode: 'overlay',
};

/* ==========================================================================
 *  SCREEN 1 — Enlarged frame (click-to-expand)
 *  Shown when a user clicks any cell in the 3×3 contact sheet.
 *  ========================================================================*/
const DarkroomEnlargedFrame = () => {
  const dim = {
    root: {
      position: 'relative', width: '100%', height: '100%',
      background: C.ink, color: C.paper,
      fontFamily: F.mono, fontSize: 13, lineHeight: 1.5,
      padding: '24px 36px', boxSizing: 'border-box', overflow: 'hidden',
    },
    bar: {
      position: 'relative', zIndex: 2,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', background: C.ink2, border: `1px solid ${C.ink3}`,
      fontSize: 11, letterSpacing: '0.04em',
    },
    crumbs: {
      position: 'relative', zIndex: 2,
      marginTop: 24, marginBottom: 18,
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      fontSize: 11, letterSpacing: '0.16em', color: C.mute2, textTransform: 'uppercase',
    },
    esc: {
      fontSize: 11, color: C.safelight, letterSpacing: '0.16em',
      border: `1px solid ${C.safelight}`, padding: '4px 10px',
    },
    stage: {
      position: 'relative', zIndex: 2,
      display: 'grid', gridTemplateColumns: '20px 1fr 20px',
      gap: 12, alignItems: 'stretch',
      height: 720, marginBottom: 18,
    },
    rail: {
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: '8px 0',
    },
    railCell: { width: 16, height: 8, background: C.ink2, borderRadius: 2 },
    frame: {
      position: 'relative', border: `1px solid ${C.ink3}`,
      background: 'radial-gradient(120% 80% at 30% 70%, #5a4a32 0%, #1a1815 60%, #0a0908 100%)',
      overflow: 'hidden',
    },
    bracket: (which) => {
      const b = { position: 'absolute', width: 28, height: 28, pointerEvents: 'none' };
      const m = {
        tl: { top: 14, left: 14, borderTop: `1.5px solid ${C.safelight}`, borderLeft: `1.5px solid ${C.safelight}` },
        tr: { top: 14, right: 14, borderTop: `1.5px solid ${C.safelight}`, borderRight: `1.5px solid ${C.safelight}` },
        bl: { bottom: 14, left: 14, borderBottom: `1.5px solid ${C.safelight}`, borderLeft: `1.5px solid ${C.safelight}` },
        br: { bottom: 14, right: 14, borderBottom: `1.5px solid ${C.safelight}`, borderRight: `1.5px solid ${C.safelight}` },
      };
      return { ...b, ...m[which] };
    },
    centerCross: {
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)', width: 36, height: 36,
      pointerEvents: 'none',
    },
    crossH: { position: 'absolute', top: 17, left: 0, right: 0, height: 1, background: C.safelight },
    crossV: { position: 'absolute', left: 17, top: 0, bottom: 0, width: 1, background: C.safelight },
    crossDot: { position: 'absolute', top: 16, left: 16, width: 4, height: 4, border: `1px solid ${C.safelight}`, borderRadius: '50%' },
    cornerTag: {
      position: 'absolute', top: 14, right: 14, padding: '4px 8px',
      fontSize: 10, letterSpacing: '0.16em', color: C.paper,
      border: `1px solid ${C.paper}`, background: 'rgba(0,0,0,0.4)',
    },
    frameLabel: {
      position: 'absolute', bottom: 14, left: 14, fontSize: 11,
      letterSpacing: '0.16em', color: C.paper,
    },
    /* EXIF strip below the frame */
    exif: {
      position: 'relative', zIndex: 2,
      display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12,
      padding: '14px 16px', background: C.ink2, border: `1px solid ${C.ink3}`,
    },
    exifCell: { display: 'flex', flexDirection: 'column', gap: 4 },
    exifK: { fontSize: 10, color: C.mute2, letterSpacing: '0.18em', textTransform: 'uppercase' },
    exifV: { fontSize: 13, color: C.paper },
    /* nav: prev / next */
    nav: {
      position: 'relative', zIndex: 2,
      display: 'flex', justifyContent: 'space-between',
      marginTop: 18, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
    },
    navItem: { color: C.mute2 },
    navItemArrow: { color: C.phosphor, marginInline: 6 },
  };

  return (
    <div style={dim.root}>
      <div style={grainOverlay} />

      {/* terminal bar (truncated, modal context) */}
      <header style={dim.bar}>
        <span style={{ width: 8, height: 8, background: C.phosphor, borderRadius: '50%' }} />
        <span style={{ color: C.phosphor }}>ercan@darkroom</span>
        <span style={{ color: C.mute }}>:</span>
        <span style={{ color: C.mute2 }}>~/portfolio/frame/04A</span>
        <span style={{ color: C.mute }}>$</span>
        <span style={{ color: C.paper }}>./enlarge --frame 04A</span>
        <span style={{ flex: 1 }} />
        <span style={dim.esc}>ESC · CLOSE</span>
      </header>

      <div style={dim.crumbs}>
        <span>// contact sheet › roll 12 › <span style={{ color: C.paper }}>frame 04A</span></span>
        <span><span style={dim.navItemArrow}>‹</span> 03A &nbsp;·&nbsp; 04A / 09 &nbsp;·&nbsp; 05A <span style={dim.navItemArrow}>›</span></span>
      </div>

      {/* the enlarged frame, flanked by sprocket rails */}
      <div style={dim.stage}>
        <div style={dim.rail}>
          {Array.from({ length: 14 }).map((_, i) => <div key={i} style={dim.railCell} />)}
        </div>
        <div style={dim.frame}>
          <div style={dim.bracket('tl')} />
          <div style={dim.bracket('tr')} />
          <div style={dim.bracket('bl')} />
          <div style={dim.bracket('br')} />
          <div style={dim.centerCross}>
            <div style={dim.crossH} />
            <div style={dim.crossV} />
            <div style={dim.crossDot} />
          </div>
          <div style={dim.cornerTag}>PORTRA 400</div>
          <div style={dim.frameLabel}>TEMPELHOF · 18:42 · 11.V.26</div>
        </div>
        <div style={dim.rail}>
          {Array.from({ length: 14 }).map((_, i) => <div key={i} style={dim.railCell} />)}
        </div>
      </div>

      {/* EXIF strip */}
      <div style={dim.exif}>
        <div style={dim.exifCell}><span style={dim.exifK}>FILM</span><span style={dim.exifV}>Kodak Portra 400</span></div>
        <div style={dim.exifCell}><span style={dim.exifK}>LENS</span><span style={dim.exifV}>35 mm f/2</span></div>
        <div style={dim.exifCell}><span style={dim.exifK}>SHUTTER</span><span style={dim.exifV}>1/250 s</span></div>
        <div style={dim.exifCell}><span style={dim.exifK}>APERTURE</span><span style={dim.exifV}>f/2.8</span></div>
        <div style={dim.exifCell}><span style={dim.exifK}>ISO</span><span style={dim.exifV}>400 (rated)</span></div>
        <div style={dim.exifCell}><span style={dim.exifK}>STATUS</span><span style={{ ...dim.exifV, color: C.phosphor }}>● developed</span></div>
      </div>

      <div style={dim.nav}>
        <span style={dim.navItem}><span style={dim.navItemArrow}>‹</span> previous frame · 03A · BOSPORUS</span>
        <span style={dim.navItem}>next frame · 05A · KREUZBERG <span style={dim.navItemArrow}>›</span></span>
      </div>
    </div>
  );
};
window.DarkroomEnlargedFrame = DarkroomEnlargedFrame;

/* ==========================================================================
 *  SCREEN 2 — Blog post detail (article typography)
 *  Sets the type rhythm for MDX-rendered posts.
 *  ========================================================================*/
const DarkroomBlogPost = () => {
  const blg = {
    root: {
      position: 'relative', width: '100%', minHeight: '100%',
      background: C.ink, color: C.paper, fontFamily: F.mono,
      fontSize: 14, lineHeight: 1.6,
      padding: '24px 36px 36px', boxSizing: 'border-box', overflow: 'hidden',
    },
    bar: {
      position: 'relative', zIndex: 2,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', background: C.ink2, border: `1px solid ${C.ink3}`,
      fontSize: 11, letterSpacing: '0.04em',
    },
    article: {
      position: 'relative', zIndex: 2, maxWidth: 760, margin: '40px auto 0',
    },
    meta: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
      color: C.mute2,
      paddingBottom: 14, marginBottom: 20,
      borderBottom: `1px solid ${C.ink3}`,
    },
    tag: { color: C.phosphor },
    h1: {
      fontFamily: F.display, fontWeight: 700,
      fontSize: 64, lineHeight: 1.02, letterSpacing: '-0.03em',
      color: C.paperHi, margin: 0, marginBottom: 18,
    },
    sub: {
      fontFamily: F.mono, fontSize: 15, color: C.paper2, lineHeight: 1.5,
      margin: 0, marginBottom: 28,
    },
    byline: {
      display: 'flex', gap: 24, fontSize: 11, letterSpacing: '0.14em',
      color: C.mute2, textTransform: 'uppercase',
      paddingBottom: 26, marginBottom: 30,
      borderBottom: `1px dashed ${C.ink3}`,
    },
    p: {
      margin: '0 0 18px', fontSize: 14, color: C.paper2, lineHeight: 1.7,
    },
    h2: {
      fontFamily: F.display, fontWeight: 700,
      fontSize: 28, lineHeight: 1.15, letterSpacing: '-0.02em',
      color: C.paperHi, margin: '36px 0 16px',
    },
    pull: {
      margin: '32px 0',
      padding: '20px 24px 18px',
      borderLeft: `2px solid ${C.safelight}`,
      background: C.ink2,
      fontFamily: F.display, fontStyle: 'italic',
      fontSize: 22, lineHeight: 1.35, color: C.paper,
      letterSpacing: '-0.01em',
    },
    inlineCode: {
      fontFamily: F.mono, fontSize: 13, color: C.phosphor,
      background: 'rgba(212,255,58,0.06)',
      border: `1px solid ${C.ink3}`,
      padding: '0 5px',
    },
    codeBlock: {
      margin: '24px 0',
      background: '#0a0a09', border: `1px solid ${C.ink3}`,
      padding: '16px 18px',
      fontSize: 12.5, lineHeight: 1.55, color: C.paper,
      overflowX: 'auto',
      whiteSpace: 'pre',
    },
    codeBar: {
      display: 'flex', justifyContent: 'space-between',
      fontSize: 10, color: C.mute2, letterSpacing: '0.16em',
      paddingBottom: 8, marginBottom: 8,
      borderBottom: `1px solid ${C.ink3}`,
      textTransform: 'uppercase',
    },
    list: { margin: '0 0 20px', paddingLeft: 0, listStyle: 'none' },
    li: {
      position: 'relative', paddingLeft: 22, marginBottom: 8,
      fontSize: 14, color: C.paper2, lineHeight: 1.6,
    },
    liMarker: {
      position: 'absolute', left: 0, top: 0,
      color: C.safelight, fontSize: 12, letterSpacing: '0.18em',
    },
    rule: { border: 0, borderTop: `1px dashed ${C.ink3}`, margin: '36px 0' },
    /* footer nav */
    footnav: {
      maxWidth: 760, margin: '48px auto 0', position: 'relative', zIndex: 2,
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
    },
    fnCard: {
      border: `1px solid ${C.ink3}`, background: C.ink2,
      padding: '14px 16px',
      fontSize: 11, letterSpacing: '0.12em', color: C.mute2, textTransform: 'uppercase',
    },
    fnLabel: { color: C.safelight, marginBottom: 8, display: 'block' },
    fnTitle: {
      fontFamily: F.display, fontWeight: 700, fontSize: 16, color: C.paperHi,
      letterSpacing: '-0.01em', textTransform: 'none', marginTop: 6,
    },
  };

  return (
    <div style={blg.root}>
      <div style={grainOverlay} />

      <header style={blg.bar}>
        <span style={{ width: 8, height: 8, background: C.phosphor, borderRadius: '50%' }} />
        <span style={{ color: C.phosphor }}>ercan@darkroom</span>
        <span style={{ color: C.mute }}>:</span>
        <span style={{ color: C.mute2 }}>~/journal/03-modern-web-apps.mdx</span>
        <span style={{ color: C.mute }}>$</span>
        <span style={{ color: C.paper }}>cat $POST</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: C.mute2, letterSpacing: '0.12em' }}>JOURNAL · ENTRY 03</span>
        <span style={{ color: C.safelight, letterSpacing: '0.16em', fontWeight: 700 }}>● REC</span>
      </header>

      <article style={blg.article}>
        <div style={blg.meta}>
          <span><span style={blg.tag}>// ENGINEERING</span> · 12 MIN READ</span>
          <span>FRAME 03 / 03 · ROLL 12</span>
        </div>

        <h1 style={blg.h1}>Building modern web applications</h1>
        <p style={blg.sub}>
          A reading list and a few principles that survived contact with three production rewrites
          and one unscheduled tram.
        </p>

        <div style={blg.byline}>
          <span>Ercan Atak</span>
          <span>10 March 2026</span>
          <span>Kreuzberg · 12049</span>
        </div>

        <p style={blg.p}>
          I keep rewriting the same site every two years and pretending it counts as engineering practice.
          What I have to show for it is a thin sediment of principles that survived a Next.js → Astro
          migration, two design rewrites, and one extremely confused weekend with edge functions.
        </p>

        <h2 style={blg.h2}>1 · Static by default, dynamic on demand</h2>
        <p style={blg.p}>
          The cheapest page is the one already on disk. The next cheapest is the one that took
          a single round-trip to render. Everything else is taste. I treat <span style={blg.inlineCode}>getStaticProps</span>
          {' '}and <span style={blg.inlineCode}>Astro.glob</span> as the default; islands hydrate the rare bits
          that genuinely need a brain.
        </p>

        <div style={blg.pull}>
          The best islands are the ones a visitor can ignore. The best static page is the one that
          doesn't notice it was static.
        </div>

        <h2 style={blg.h2}>2 · Token your colors before your components</h2>
        <p style={blg.p}>
          Picking <span style={blg.inlineCode}>#0d0d0c</span>, <span style={blg.inlineCode}>#ff3b30</span>{' '}
          and <span style={blg.inlineCode}>#d4ff3a</span> early gave the whole redesign somewhere to land.
          Component variants resolved themselves once the palette was tight enough that any new color
          felt obviously wrong.
        </p>

        <ul style={blg.list}>
          <li style={blg.li}><span style={blg.liMarker}>▸</span> Pick a four-token palette before you draw any component.</li>
          <li style={blg.li}><span style={blg.liMarker}>▸</span> Restrict yourself to one font family + one display face.</li>
          <li style={blg.li}><span style={blg.liMarker}>▸</span> Keep the radius scale at exactly <span style={blg.inlineCode}>0</span> until you can defend each non-zero value out loud.</li>
        </ul>

        <h2 style={blg.h2}>3 · A loud terminal beats a quiet button</h2>
        <p style={blg.p}>
          The status bar at the top of this site is a lie — there is no shell process behind it.
          But it carries six pieces of metadata (location, build, time, locale, recording state, prompt)
          in roughly the same space a typical UI uses for a logo and three nav links. Density is a
          design choice. Restraint isn't always the right one.
        </p>

        <div style={blg.codeBlock}>
          <div style={blg.codeBar}>
            <span>~/portfolio/src/lib/build.ts</span>
            <span style={{ color: C.phosphor }}>TS · 12 LINES</span>
          </div>
{`export async function build(): Promise<Result> {
  const t0 = performance.now();
  const pages = await collect();
  for (const p of pages) {
    await render(p);
  }
  return { count: pages.length, ms: performance.now() - t0 };
}`}
        </div>

        <hr style={blg.rule} />

        <p style={blg.p}>
          That's the lot. The next entry is about why I started painting again, which is much harder
          to explain than build pipelines.
        </p>
      </article>

      <nav style={blg.footnav}>
        <div style={blg.fnCard}>
          <span style={blg.fnLabel}>‹ previous frame</span>
          <div>02 · TYPESCRIPT</div>
          <div style={blg.fnTitle}>TypeScript, with patience</div>
        </div>
        <div style={{ ...blg.fnCard, textAlign: 'right' }}>
          <span style={blg.fnLabel}>next frame ›</span>
          <div>01 · ASTRO</div>
          <div style={blg.fnTitle}>Getting started with Astro</div>
        </div>
      </nav>
    </div>
  );
};
window.DarkroomBlogPost = DarkroomBlogPost;

/* ==========================================================================
 *  SCREEN 3 — Mobile homepage (~390 px wide)
 *  ========================================================================*/
const DarkroomMobile = () => {
  const m = {
    root: {
      position: 'relative', width: '100%', minHeight: '100%',
      background: C.ink, color: C.paper, fontFamily: F.mono,
      fontSize: 12, lineHeight: 1.5,
      padding: '12px 14px 24px', boxSizing: 'border-box', overflow: 'hidden',
    },
    bar: {
      position: 'relative', zIndex: 2,
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 10px', background: C.ink2, border: `1px solid ${C.ink3}`,
      fontSize: 10, letterSpacing: '0.04em',
    },
    burger: {
      display: 'flex', flexDirection: 'column', gap: 3,
      width: 16, marginLeft: 'auto',
    },
    burgerLine: { height: 1, background: C.paper },
    metaRow: {
      position: 'relative', zIndex: 2,
      display: 'flex', justifyContent: 'space-between',
      marginTop: 18, marginBottom: 14,
      fontSize: 9, letterSpacing: '0.16em',
      color: C.mute2,
    },
    h1: {
      position: 'relative', zIndex: 2,
      fontFamily: F.display, fontWeight: 700, fontSize: 72, lineHeight: 0.88,
      letterSpacing: '-0.04em', color: C.paperHi, margin: 0,
      display: 'flex', flexDirection: 'column',
    },
    tagline: {
      position: 'relative', zIndex: 2,
      marginTop: 14, fontSize: 11, color: C.phosphor, letterSpacing: '0.08em',
    },
    intro: {
      position: 'relative', zIndex: 2,
      marginTop: 14, fontSize: 12, color: C.paper2, lineHeight: 1.55,
    },
    nav: {
      position: 'relative', zIndex: 2,
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
      marginTop: 18, marginBottom: 20,
    },
    navItem: {
      border: `1px solid ${C.ink3}`, padding: '8px 10px',
      fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
    },
    navN: { color: C.safelight, marginRight: 6 },
    term: {
      position: 'relative', zIndex: 2,
      background: C.ink2, border: `1px solid ${C.ink3}`,
      padding: '12px 12px', marginBottom: 20,
    },
    termHead: {
      fontSize: 9, color: C.mute2, letterSpacing: '0.18em',
      paddingBottom: 8, marginBottom: 10, borderBottom: `1px solid ${C.ink3}`,
      textTransform: 'uppercase',
    },
    termPre: {
      margin: 0, fontSize: 11, lineHeight: 1.65, color: C.paper, whiteSpace: 'pre-wrap',
    },
    sectionLabel: {
      position: 'relative', zIndex: 2,
      fontSize: 9, color: C.mute2, letterSpacing: '0.18em', textTransform: 'uppercase',
      margin: '4px 0 10px',
    },
    sprocket: {
      position: 'relative', zIndex: 2,
      display: 'flex', gap: 0, justifyContent: 'space-between',
      padding: '4px 0', background: C.ink2, marginBottom: 8,
    },
    sCell: { width: 14, height: 7, background: C.ink, borderRadius: 2 },
    sheet: {
      position: 'relative', zIndex: 2,
      display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6,
      padding: 6, background: C.ink2, border: `1px solid ${C.ink3}`,
    },
    cell: {
      position: 'relative', aspectRatio: '4/3', border: `1px solid ${C.ink3}`,
      overflow: 'hidden',
    },
    cellNum: {
      position: 'absolute', top: 4, left: 4, fontSize: 8,
      color: C.phosphor, letterSpacing: '0.12em',
      background: 'rgba(0,0,0,0.6)', padding: '1px 4px',
    },
    cellTag: {
      position: 'absolute', top: 4, right: 4, fontSize: 7,
      letterSpacing: '0.14em', color: C.paper,
      border: `1px solid ${C.paper}`, padding: '1px 3px',
      background: 'rgba(0,0,0,0.5)',
    },
    cellLabel: {
      position: 'absolute', left: 6, bottom: 6, fontSize: 8,
      letterSpacing: '0.14em', color: C.paper,
    },
    /* EXIF cards */
    exifLabel: {
      position: 'relative', zIndex: 2,
      fontSize: 9, color: C.mute2, letterSpacing: '0.18em',
      textTransform: 'uppercase', margin: '24px 0 10px',
    },
    exifCard: {
      position: 'relative', zIndex: 2,
      border: `1px solid ${C.ink3}`, background: C.ink2,
      padding: '14px 14px', marginBottom: 8,
    },
    exifIdx: { fontSize: 9, color: C.safelight, letterSpacing: '0.18em' },
    exifTitle: {
      fontFamily: F.display, fontWeight: 700, fontSize: 22, color: C.paperHi,
      letterSpacing: '-0.02em', marginTop: 6,
    },
    exifSub: { fontSize: 11, color: C.paper2, marginTop: 4, marginBottom: 10 },
    exifList: {
      borderTop: `1px dashed ${C.ink3}`, borderBottom: `1px dashed ${C.ink3}`,
      padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 3,
    },
    exifLine: { fontSize: 9, color: C.mute2, letterSpacing: '0.10em' },
    exifLink: {
      fontSize: 10, color: C.phosphor, letterSpacing: '0.12em',
      marginTop: 8, textTransform: 'uppercase',
    },
    foot: {
      position: 'relative', zIndex: 2,
      marginTop: 22, paddingTop: 12, borderTop: `1px solid ${C.ink3}`,
      display: 'flex', flexDirection: 'column', gap: 4,
      fontSize: 9, color: C.mute, letterSpacing: '0.16em',
    },
    footL: { color: C.safelight },
  };

  /* photo cell helper */
  const photoBg = (tone) => {
    const map = {
      a: 'radial-gradient(120% 80% at 30% 70%, #5a4a32 0%, #1a1815 60%, #0a0908 100%)',
      b: 'linear-gradient(180deg, #3a4d52 0%, #1a2227 70%, #0a0e10 100%)',
      d: 'radial-gradient(100% 60% at 50% 100%, #6a2a2e 0%, #1a0d0e 60%, #08070a 100%)',
      e: 'linear-gradient(180deg, #2a2a28 0%, #4a4845 50%, #1a1816 100%)',
    };
    return map[tone] || map.a;
  };

  return (
    <div style={m.root}>
      <div style={grainOverlay} />

      {/* terminal bar — collapsed */}
      <header style={m.bar}>
        <span style={{ width: 6, height: 6, background: C.phosphor, borderRadius: '50%' }} />
        <span style={{ color: C.paper }}>./develop</span>
        <span style={{ color: C.safelight, letterSpacing: '0.16em', fontWeight: 700, marginLeft: 'auto' }}>● REC</span>
        <div style={m.burger}>
          <div style={m.burgerLine} /><div style={m.burgerLine} /><div style={m.burgerLine} />
        </div>
      </header>

      <div style={m.metaRow}>
        <span>ROLL 12 · F/2.8</span>
        <span>1/250 · ISO 400</span>
      </div>

      <h1 style={m.h1}><span>ercan</span><span>atak</span></h1>
      <p style={m.tagline}>// dev · photog · painter</p>
      <p style={m.intro}>
        I keep three darkrooms: one for software, one for film, one for paint.
        Below is the latest contact sheet — frames as they came back, unranked.
      </p>

      <div style={m.nav}>
        {['home', 'sheet', 'journal', 'rolls', 'paints', 'reach'].map((n, i) => (
          <span key={n} style={m.navItem}>
            <span style={m.navN}>{String(i + 1).padStart(2, '0')}</span>{n}
          </span>
        ))}
      </div>

      <div style={m.term}>
        <div style={m.termHead}>~/journal/feed.sh</div>
        <pre style={m.termPre}>
<span style={{ color: C.safelight }}>$</span> cat ~/blog/*.mdx | head{'\n'}
<span style={{ color: C.phosphor }}>▸ 2026-03-10</span>  building modern web apps{'\n'}
<span style={{ color: C.phosphor }}>▸ 2026-02-20</span>  typescript, with patience{'\n'}
<span style={{ color: C.phosphor }}>▸ 2026-01-15</span>  getting started with astro{'\n'}
<span style={{ color: C.safelight }}>$</span> whoami{'\n'}
ercan — full-stack, half-painter,{'\n'}
        based in Kreuzberg{'\n'}
<span style={{ color: C.safelight }}>$</span> _
        </pre>
      </div>

      <div style={m.sectionLabel}>// CONTACT SHEET · ROLL 12</div>

      <div style={m.sprocket}>
        {Array.from({ length: 10 }).map((_, i) => <div key={i} style={m.sCell} />)}
      </div>

      <div style={m.sheet}>
        {[
          { t: 'a', label: 'TEMPELHOF', tag: 'PORTRA' },
          { t: 'b', label: 'BOSPORUS',   tag: '35MM' },
          { t: 'd', label: 'KREUZBERG',  tag: 'TRI-X' },
          { t: 'e', label: 'STUDIO',     tag: '120MM' },
        ].map((c, i) => (
          <div key={i} style={{ ...m.cell, background: photoBg(c.t) }}>
            <span style={m.cellNum}>{String(i + 1).padStart(2, '0')}A</span>
            <span style={m.cellTag}>{c.tag}</span>
            <span style={m.cellLabel}>{c.label}</span>
          </div>
        ))}
      </div>

      <div style={m.sprocket}>
        {Array.from({ length: 10 }).map((_, i) => <div key={i} style={m.sCell} />)}
      </div>

      <div style={m.exifLabel}>// EXIF — work that paid the rent</div>

      {[
        { i: '01/03', t: 'MaHalle',           s: 'Home-made Facebook for the Kiez', exif: ['STACK · Next.js + Mongo', 'YEAR · 2024', 'STATUS · live'] },
        { i: '02/03', t: 'Dogs & Films',      s: 'A catalogue, two obsessions',     exif: ['STACK · Next.js + Tailwind', 'YEAR · 2023', 'STATUS · live'] },
      ].map((p, idx) => (
        <div key={idx} style={m.exifCard}>
          <div style={m.exifIdx}>{p.i}</div>
          <div style={m.exifTitle}>{p.t}</div>
          <div style={m.exifSub}>{p.s}</div>
          <div style={m.exifList}>
            {p.exif.map((e, j) => <div key={j} style={m.exifLine}>{e}</div>)}
          </div>
          <div style={m.exifLink}>open frame →</div>
        </div>
      ))}

      <div style={m.foot}>
        <span style={m.footL}>FRAME 36/36 — END OF ROLL</span>
        <span>atakee@gmail.com · +49 30 88694300</span>
        <span>© ATAK · 2026</span>
      </div>
    </div>
  );
};
window.DarkroomMobile = DarkroomMobile;

/* ==========================================================================
 *  SCREEN 4 — /lens · Rolls index
 *  A grid of all developed rolls. Each card is a mini contact-sheet collage
 *  + film/EXIF metadata. Click → opens /lens/[slug].
 *  ========================================================================*/
const DarkroomLensIndex = () => {
  const ls = {
    root: {
      position: 'relative', width: '100%', minHeight: '100%',
      background: C.ink, color: C.paper, fontFamily: F.mono,
      fontSize: 13, lineHeight: 1.5,
      padding: '24px 36px 36px', boxSizing: 'border-box', overflow: 'hidden',
    },
    bar: {
      position: 'relative', zIndex: 2,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', background: C.ink2, border: `1px solid ${C.ink3}`,
      fontSize: 11, letterSpacing: '0.04em',
    },
    head: {
      position: 'relative', zIndex: 2,
      display: 'grid', gridTemplateColumns: '1.4fr 1fr',
      gap: 32, padding: '36px 0 26px',
    },
    metaLine: { fontSize: 11, color: C.mute2, letterSpacing: '0.16em', marginBottom: 22, textTransform: 'uppercase' },
    h1: {
      margin: 0, fontFamily: F.display, fontWeight: 700,
      fontSize: 96, lineHeight: 0.92, letterSpacing: '-0.04em',
      color: C.paperHi,
    },
    sub: {
      marginTop: 16, fontSize: 13, color: C.phosphor, letterSpacing: '0.08em',
    },
    intro: {
      marginTop: 22, maxWidth: 460,
      fontSize: 13, color: C.paper2, lineHeight: 1.6,
    },
    panel: {
      background: C.ink2, border: `1px solid ${C.ink3}`,
      padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 10,
    },
    panelHead: {
      fontSize: 10, color: C.mute2, letterSpacing: '0.18em',
      paddingBottom: 10, borderBottom: `1px solid ${C.ink3}`, textTransform: 'uppercase',
    },
    statRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12 },
    statK: { color: C.mute2, letterSpacing: '0.14em', textTransform: 'uppercase' },
    statV: { color: C.paper },
    chipRow: {
      position: 'relative', zIndex: 2,
      display: 'flex', flexWrap: 'wrap', gap: 6,
      paddingBottom: 18, marginBottom: 18,
      borderBottom: `1px dashed ${C.ink3}`,
    },
    chip: (on) => ({
      fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
      padding: '4px 10px',
      border: `1px solid ${on ? C.phosphor : C.ink3}`,
      color: on ? C.phosphor : C.mute2,
      background: on ? 'rgba(212,255,58,0.06)' : 'transparent',
    }),
    chipLabel: {
      fontSize: 10, letterSpacing: '0.18em', color: C.mute, textTransform: 'uppercase',
      marginRight: 8, paddingTop: 6,
    },

    /* roll cards grid */
    grid: {
      position: 'relative', zIndex: 2,
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
    },
    card: {
      position: 'relative', border: `1px solid ${C.ink3}`, background: C.ink2,
      padding: 10,
      display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'background 150ms',
    },
    miniSheet: {
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3,
    },
    miniCell: (bg) => ({
      aspectRatio: '4/3', background: bg, position: 'relative',
      border: `1px solid ${C.ink3}`,
    }),
    rollMeta: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      paddingTop: 4,
    },
    rollNum: { fontSize: 10, color: C.safelight, letterSpacing: '0.18em' },
    rollLoc: { fontSize: 10, color: C.mute2, letterSpacing: '0.14em', textTransform: 'uppercase' },
    rollTitle: {
      fontFamily: F.display, fontWeight: 700,
      fontSize: 22, lineHeight: 1.05, letterSpacing: '-0.02em',
      color: C.paperHi, margin: 0,
    },
    rollExif: {
      display: 'flex', justifyContent: 'space-between',
      paddingTop: 8, marginTop: 4,
      borderTop: `1px dashed ${C.ink3}`,
      fontSize: 10, color: C.mute2, letterSpacing: '0.12em',
    },
    rollLink: {
      fontSize: 10, color: C.phosphor, letterSpacing: '0.14em',
      textTransform: 'uppercase', marginTop: 4,
    },
  };

  // gradient palette for mini thumbs (re-use main palette + a couple of warm tones)
  const TONES = {
    a: 'radial-gradient(120% 80% at 30% 70%, #5a4a32 0%, #1a1815 60%, #0a0908 100%)',
    b: 'linear-gradient(180deg, #3a4d52 0%, #1a2227 70%, #0a0e10 100%)',
    d: 'radial-gradient(100% 60% at 50% 100%, #6a2a2e 0%, #1a0d0e 60%, #08070a 100%)',
    e: 'linear-gradient(180deg, #2a2a28 0%, #4a4845 50%, #1a1816 100%)',
    g: 'linear-gradient(180deg, #1a1815 0%, #2a2520 50%, #0a0908 100%)',
    h: 'linear-gradient(200deg, #2c3e50 0%, #14252c 60%, #060c0e 100%)',
    i: 'radial-gradient(80% 60% at 70% 30%, #6b5234 0%, #1c1410 60%, #060403 100%)',
  };

  const rolls = [
    { num: 'ROLL 14', title: 'Berlin Nights',     loc: 'Berlin',           year: 2024, film: 'Tri-X 400',     frames: 27, tones: ['d','b','d','g','e','b'] },
    { num: 'ROLL 13', title: 'Bosporus Mornings', loc: 'Istanbul',         year: 2024, film: 'Portra 400',    frames: 36, tones: ['b','a','i','b','a','b'] },
    { num: 'ROLL 12', title: 'Kreuzberg Interiors', loc: 'Berlin · 12049', year: 2024, film: 'HP5 Plus',      frames: 24, tones: ['e','a','g','e','a','g'] },
    { num: 'ROLL 11', title: 'Tempelhofer Feld',  loc: 'Berlin',           year: 2023, film: 'Portra 400',    frames: 33, tones: ['a','a','i','a','d','i'] },
    { num: 'ROLL 10', title: 'Studio · North Light', loc: 'Berlin',        year: 2023, film: '120mm Ektar',   frames: 12, tones: ['e','e','h','e','h','e'] },
    { num: 'ROLL 09', title: 'After the Rain',    loc: 'Berlin',           year: 2023, film: 'HP5 Plus',      frames: 24, tones: ['h','b','g','h','b','g'] },
    { num: 'ROLL 08', title: 'U-Bahn Late',       loc: 'Berlin',           year: 2022, film: 'Tri-X pushed',  frames: 30, tones: ['g','d','g','g','d','g'] },
    { num: 'ROLL 07', title: 'Anatolia',          loc: 'Cappadocia',       year: 2022, film: 'Portra 400',    frames: 36, tones: ['i','i','a','i','a','i'] },
    { num: 'ROLL 06', title: 'Kiez at Noon',      loc: 'Berlin · 12049',   year: 2022, film: 'Ektar 100',     frames: 24, tones: ['a','e','a','i','e','a'] },
  ];

  return (
    <div style={ls.root}>
      <div style={grainOverlay} />

      <header style={ls.bar}>
        <span style={{ width: 8, height: 8, background: C.phosphor, borderRadius: '50%' }} />
        <span style={{ color: C.phosphor }}>ercan@darkroom</span>
        <span style={{ color: C.mute }}>:</span>
        <span style={{ color: C.mute2 }}>~/lens</span>
        <span style={{ color: C.mute }}>$</span>
        <span style={{ color: C.paper }}>ls -la rolls/</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: C.mute2, letterSpacing: '0.12em' }}>12 ROLLS · 287 FRAMES</span>
        <span style={{ color: C.safelight, letterSpacing: '0.16em', fontWeight: 700 }}>● REC</span>
      </header>

      <div style={ls.head}>
        <div>
          <div style={ls.metaLine}>// LENS · 35MM + DIGITAL · 2014 — 2026</div>
          <h1 style={ls.h1}>rolls</h1>
          <div style={ls.sub}>// twelve developed · two-hundred-eighty-seven frames archived</div>
          <p style={ls.intro}>
            Every roll I've finished and developed. Browse by film, by year, or by where
            I happened to be. Frames inside each roll are unranked — first developed first
            shown.
          </p>
        </div>
        <aside style={ls.panel}>
          <div style={ls.panelHead}>~/lens/manifest.txt</div>
          <div style={ls.statRow}><span style={ls.statK}>TOTAL ROLLS</span><span style={ls.statV}>12</span></div>
          <div style={ls.statRow}><span style={ls.statK}>TOTAL FRAMES</span><span style={ls.statV}>287</span></div>
          <div style={ls.statRow}><span style={ls.statK}>EARLIEST</span><span style={ls.statV}>2014 · Istanbul</span></div>
          <div style={ls.statRow}><span style={ls.statK}>LATEST</span><span style={ls.statV}>2024 · Berlin</span></div>
          <div style={ls.statRow}><span style={ls.statK}>FORMATS</span><span style={ls.statV}>35mm · 120mm · digital</span></div>
        </aside>
      </div>

      {/* filter chips */}
      <div style={ls.chipRow}>
        <span style={ls.chipLabel}>FILTER ·</span>
        <span style={ls.chip(true)}>ALL</span>
        <span style={ls.chip(false)}>BERLIN</span>
        <span style={ls.chip(false)}>ISTANBUL</span>
        <span style={ls.chip(false)}>STUDIO</span>
        <span style={ls.chip(false)}>PORTRA 400</span>
        <span style={ls.chip(false)}>TRI-X 400</span>
        <span style={ls.chip(false)}>HP5 PLUS</span>
        <span style={ls.chip(false)}>2024</span>
        <span style={ls.chip(false)}>2023</span>
        <span style={ls.chip(false)}>2022</span>
        <span style={ls.chip(false)}>2014–21</span>
      </div>

      {/* roll grid */}
      <div style={ls.grid}>
        {rolls.map((r, i) => (
          <article key={i} style={ls.card}>
            <div style={ls.miniSheet}>
              {r.tones.map((t, j) => (
                <div key={j} style={ls.miniCell(TONES[t])} />
              ))}
            </div>
            <div style={ls.rollMeta}>
              <span style={ls.rollNum}>{r.num}</span>
              <span style={ls.rollLoc}>{r.loc}</span>
            </div>
            <h3 style={ls.rollTitle}>{r.title}</h3>
            <div style={ls.rollExif}>
              <span>{r.year}</span>
              <span>{r.film}</span>
              <span>{r.frames} frames</span>
            </div>
            <span style={ls.rollLink}>open roll →</span>
          </article>
        ))}
      </div>
    </div>
  );
};
window.DarkroomLensIndex = DarkroomLensIndex;

/* ==========================================================================
 *  SCREEN 5 — /lens/[slug] · Single roll
 *  One thematic gallery, rendered as a large contact sheet (4×5 = 20 frames)
 *  with sprocket rails, EXIF header, field notes, and prev/next navigation.
 *  ========================================================================*/
const DarkroomLensRoll = () => {
  const rl = {
    root: {
      position: 'relative', width: '100%', minHeight: '100%',
      background: C.ink, color: C.paper, fontFamily: F.mono,
      fontSize: 13, lineHeight: 1.5,
      padding: '24px 36px 36px', boxSizing: 'border-box', overflow: 'hidden',
    },
    bar: {
      position: 'relative', zIndex: 2,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', background: C.ink2, border: `1px solid ${C.ink3}`,
      fontSize: 11, letterSpacing: '0.04em',
    },
    crumbs: {
      position: 'relative', zIndex: 2,
      marginTop: 22, fontSize: 11, color: C.mute2, letterSpacing: '0.16em',
      textTransform: 'uppercase',
    },
    crumbsTo: { color: C.paper },
    head: {
      position: 'relative', zIndex: 2,
      display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32,
      padding: '14px 0 28px', borderBottom: `1px solid ${C.ink3}`, marginBottom: 18,
    },
    h1: {
      margin: 0, fontFamily: F.display, fontWeight: 700,
      fontSize: 88, lineHeight: 0.92, letterSpacing: '-0.04em',
      color: C.paperHi,
    },
    rollNum: {
      fontSize: 11, color: C.safelight, letterSpacing: '0.22em',
      marginBottom: 12,
    },
    notes: {
      marginTop: 18, maxWidth: 520,
      fontSize: 13, color: C.paper2, lineHeight: 1.65,
    },
    exifPanel: {
      background: C.ink2, border: `1px solid ${C.ink3}`,
      padding: '16px 18px', alignSelf: 'start',
    },
    exifHead: {
      fontSize: 10, color: C.mute2, letterSpacing: '0.18em',
      paddingBottom: 10, borderBottom: `1px solid ${C.ink3}`, marginBottom: 10,
      textTransform: 'uppercase',
    },
    exifRow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12 },
    exifK: { color: C.mute2, letterSpacing: '0.14em', textTransform: 'uppercase' },
    exifV: { color: C.paper },

    sprocket: {
      position: 'relative', zIndex: 2,
      display: 'flex', justifyContent: 'space-between',
      padding: '6px 0', background: C.ink2, margin: '6px 0',
    },
    sCell: { width: 28, height: 12, background: C.ink, borderRadius: 2 },

    sheet: {
      position: 'relative', zIndex: 2,
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6,
      padding: 8, background: C.ink2, border: `1px solid ${C.ink3}`,
    },
    cell: (bg) => ({
      position: 'relative', aspectRatio: '4/3',
      border: `1px solid ${C.ink3}`, overflow: 'hidden',
      background: bg,
    }),
    cellNum: {
      position: 'absolute', top: 4, left: 4, zIndex: 2,
      fontSize: 9, color: C.phosphor, letterSpacing: '0.12em',
      background: 'rgba(0,0,0,0.6)', padding: '1px 4px',
    },
    cellLabel: {
      position: 'absolute', left: 6, bottom: 6,
      fontSize: 8, letterSpacing: '0.14em', color: C.paper,
    },
    cellStar: {
      position: 'absolute', top: 4, right: 4, fontSize: 9,
      color: C.safelight, letterSpacing: '0.1em',
    },

    nav: {
      position: 'relative', zIndex: 2,
      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
      marginTop: 22,
    },
    navCard: (align) => ({
      border: `1px solid ${C.ink3}`, background: C.ink2,
      padding: '14px 18px',
      fontSize: 11, letterSpacing: '0.14em', color: C.mute2,
      textTransform: 'uppercase', textAlign: align,
    }),
    navLabel: { color: C.safelight, marginBottom: 6, display: 'block' },
    navTitle: {
      fontFamily: F.display, fontWeight: 700, fontSize: 16,
      color: C.paperHi, letterSpacing: '-0.01em', textTransform: 'none', marginTop: 6,
    },
  };

  const TONES = {
    a: 'radial-gradient(120% 80% at 30% 70%, #5a4a32 0%, #1a1815 60%, #0a0908 100%)',
    b: 'linear-gradient(180deg, #3a4d52 0%, #1a2227 70%, #0a0e10 100%)',
    d: 'radial-gradient(100% 60% at 50% 100%, #6a2a2e 0%, #1a0d0e 60%, #08070a 100%)',
    e: 'linear-gradient(180deg, #2a2a28 0%, #4a4845 50%, #1a1816 100%)',
    g: 'linear-gradient(180deg, #1a1815 0%, #2a2520 50%, #0a0908 100%)',
    h: 'linear-gradient(200deg, #2c3e50 0%, #14252c 60%, #060c0e 100%)',
  };

  // 20 frames for roll 14 · Berlin Nights · Tri-X 400
  const frames = [
    { t:'d', l:'KOTTBUSSER TOR · 22:14', s: true  },
    { t:'b', l:'U8 · 23:01',             s: false },
    { t:'g', l:'KREUZBERG · 23:54',      s: true  },
    { t:'d', l:'PRINZESSINNENSTR · 00:12', s:false},
    { t:'b', l:'SPREE · 00:48',          s: false },
    { t:'g', l:'GÖRLITZER PARK · 01:22', s: true  },
    { t:'d', l:'BARGAIN BAR · 01:55',    s: false },
    { t:'e', l:'KOTTI BRIDGE',           s: false },
    { t:'h', l:'NEUKÖLLN · 02:31',       s: false },
    { t:'g', l:'TEMPELHOF · 03:04',      s: true  },
    { t:'d', l:'U-BAHN STAIRS',          s: false },
    { t:'b', l:'HASENHEIDE',             s: false },
    { t:'g', l:'PAUL-LINCKE-UFER',       s: false },
    { t:'d', l:'WARSCHAUER · 03:46',     s: false },
    { t:'b', l:'OSTBAHNHOF · 04:11',     s: false },
    { t:'e', l:'YORCKSTR ·  04:39',      s: false },
    { t:'g', l:'BERGMANNSTR',            s: false },
    { t:'d', l:'CHAMISSOPLATZ',          s: true  },
    { t:'b', l:'SCHLESISCHES TOR',       s: false },
    { t:'g', l:'12049 · DAWN',           s: false },
  ];

  return (
    <div style={rl.root}>
      <div style={grainOverlay} />

      <header style={rl.bar}>
        <span style={{ width: 8, height: 8, background: C.phosphor, borderRadius: '50%' }} />
        <span style={{ color: C.phosphor }}>ercan@darkroom</span>
        <span style={{ color: C.mute }}>:</span>
        <span style={{ color: C.mute2 }}>~/lens/rolls/14-berlin-nights</span>
        <span style={{ color: C.mute }}>$</span>
        <span style={{ color: C.paper }}>./develop --roll 14</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: C.mute2, letterSpacing: '0.12em' }}>ROLL 14 / 12 · 27 FRAMES</span>
        <span style={{ color: C.safelight, letterSpacing: '0.16em', fontWeight: 700 }}>● REC</span>
      </header>

      <div style={rl.crumbs}>
        ~/ &nbsp;›&nbsp; <a style={rl.crumbsTo}>lens</a> &nbsp;›&nbsp; <a style={rl.crumbsTo}>rolls</a> &nbsp;›&nbsp; <span style={{ color: C.paper }}>14-berlin-nights</span>
      </div>

      <div style={rl.head}>
        <div>
          <div style={rl.rollNum}>ROLL 14 · TRI-X 400 · PUSHED +1</div>
          <h1 style={rl.h1}>Berlin Nights</h1>
          <p style={rl.notes}>
            Six weeks, three walks a week, one camera. The whole roll happened between
            22:00 and 04:30 — Kotti to Tempelhof, mostly on foot, occasionally on the U8.
            I push Tri-X one stop for the grain. The stars mark frames that made the final
            print run.
          </p>
        </div>
        <aside style={rl.exifPanel}>
          <div style={rl.exifHead}>~/rolls/14/manifest.txt</div>
          <div style={rl.exifRow}><span style={rl.exifK}>ROLL</span><span style={rl.exifV}>14 / 12</span></div>
          <div style={rl.exifRow}><span style={rl.exifK}>FILM</span><span style={rl.exifV}>Kodak Tri-X 400</span></div>
          <div style={rl.exifRow}><span style={rl.exifK}>RATED</span><span style={rl.exifV}>ISO 800 (push +1)</span></div>
          <div style={rl.exifRow}><span style={rl.exifK}>CAMERA</span><span style={rl.exifV}>Leica M6 · 35 mm</span></div>
          <div style={rl.exifRow}><span style={rl.exifK}>FRAMES</span><span style={rl.exifV}>27 of 36 kept</span></div>
          <div style={rl.exifRow}><span style={rl.exifK}>DATE</span><span style={rl.exifV}>Oct — Nov 2024</span></div>
          <div style={rl.exifRow}><span style={rl.exifK}>STATUS</span><span style={{ ...rl.exifV, color: C.phosphor }}>● developed</span></div>
        </aside>
      </div>

      <div style={rl.sprocket} aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => <div key={i} style={rl.sCell} />)}
      </div>

      <div style={rl.sheet}>
        {frames.map((f, i) => (
          <div key={i} style={rl.cell(TONES[f.t])}>
            <span style={rl.cellNum}>{String(i + 1).padStart(2, '0')}A</span>
            {f.s && <span style={rl.cellStar}>★</span>}
            <span style={rl.cellLabel}>{f.l}</span>
          </div>
        ))}
      </div>

      <div style={rl.sprocket} aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => <div key={i} style={rl.sCell} />)}
      </div>

      <div style={rl.nav}>
        <div style={rl.navCard('left')}>
          <span style={rl.navLabel}>‹ previous roll</span>
          <div>ROLL 13 · ISTANBUL</div>
          <div style={rl.navTitle}>Bosporus Mornings</div>
        </div>
        <div style={rl.navCard('center')}>
          <span style={rl.navLabel}>↑ all rolls</span>
          <div>12 rolls · 287 frames</div>
          <div style={rl.navTitle}>← back to /lens</div>
        </div>
        <div style={rl.navCard('right')}>
          <span style={rl.navLabel}>next roll ›</span>
          <div>ROLL 15 · STUDIO</div>
          <div style={rl.navTitle}>December Light</div>
        </div>
      </div>
    </div>
  );
};
window.DarkroomLensRoll = DarkroomLensRoll;
