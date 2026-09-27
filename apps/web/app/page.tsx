import { BrandMark } from '../components/brand-mark';
import { IntakeForm } from '../components/intake-form';

const capabilities = [
  { number: '01', title: 'Brand & Content Strategy', copy: 'Find the cultural truth, define the point of view, and build the system that can carry it.', className: 'cap-strategy' },
  { number: '02', title: 'Creative Development', copy: 'Turn sharp strategy into formats, treatments, scripts, and ideas people choose to spend time with.', className: 'cap-creative' },
  { number: '03', title: 'Video + Multimedia Production', copy: 'Make every frame, sound, and cut earn attention—from a single hero film to a living content universe.', className: 'cap-production' },
  { number: '04', title: 'Creator Partnerships', copy: 'Build credible collaborations around shared audience, taste, and purpose—not borrowed reach.', className: 'cap-creators' },
  { number: '05', title: 'Distribution', copy: 'Engineer the release so the story arrives in the right shape, place, sequence, and moment.', className: 'cap-distribution' },
  { number: '06', title: 'Audience Intelligence', copy: 'Read the signals behind attention and convert real behavior into the next creative decision.', className: 'cap-intelligence' },
  { number: '07', title: 'Originals & IP', copy: 'Develop owned worlds with the depth to grow across films, series, audio, editorial, and emerging formats.', className: 'cap-originals' }
] as const;

const worlds = [
  { name: 'TableGrid', index: 'WORLD 01', field: 'Food / Network / Brand storytelling', line: 'A living table for the people, rituals, and ideas shaping how culture eats.', className: 'world-tablegrid' },
  { name: 'VYRAL', index: 'WORLD 02', field: 'Gaming / Community / Entertainment', line: 'Competitive energy and community stories, designed beyond the highlight reel.', className: 'world-vyral' },
  { name: 'Yaadbody', index: 'WORLD 03', field: 'Wellness / Education / Lifestyle', line: 'A grounded, culturally fluent world for feeling well and living whole.', className: 'world-yaadbody' }
] as const;

const relationship = [
  ['01', 'Discover', 'We find the real objective, the cultural opening, and what the audience should feel or do.'],
  ['02', 'Build', 'We shape the strategy, story, formats, makers, and measurement into one clear operating idea.'],
  ['03', 'Release', 'We produce and sequence the work for the ways people actually encounter media.'],
  ['04', 'Learn', 'We read attention as evidence—what held, moved, traveled, and converted.'],
  ['05', 'Compound', 'We feed the learning forward so the next release begins smarter and lands harder.']
] as const;

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 28 14">
      <path d="M1 7h24M19 1l6 6-6 6" />
    </svg>
  );
}

function HeroComposition() {
  return (
    <div className="hero-composition" aria-label="A story moving through video, audio, editorial, and audience signals">
      <div className="hero-orbit orbit-one" />
      <div className="hero-orbit orbit-two" />
      <article className="media-frame frame-video">
        <div className="video-sky"><i /><i /><i /></div>
        <div className="frame-meta"><span>01:24</span><span>PORTRAIT FILM</span></div>
        <strong>Roots move<br />forward.</strong>
        <div className="play-mark"><span>▶</span></div>
      </article>
      <article className="media-frame frame-audio">
        <span className="frame-label">VOICE NOTE / 04</span>
        <div className="waveform" aria-hidden="true">
          {[12, 25, 40, 18, 52, 33, 65, 29, 45, 18, 57, 35, 21, 47, 28, 16, 38, 24].map((height, index) => <i key={index} style={{ height }} />)}
        </div>
        <div className="audio-time"><span>02:18</span><span>—04:03</span></div>
      </article>
      <article className="media-frame frame-editorial">
        <span className="frame-label">FIELD NOTE 08</span>
        <blockquote>“Make the feeling travel farther than the format.”</blockquote>
        <span className="editorial-rule" />
      </article>
      <article className="media-frame frame-signal">
        <div><span className="signal-live"><i /> LIVE SIGNAL</span><b>78%</b></div>
        <p>Held past the first turn</p>
        <svg aria-hidden="true" viewBox="0 0 210 55"><path d="M2 48C24 45 26 38 43 40s27 10 44 1 25-3 40-18 27 4 40-5 21-13 41-16" /></svg>
      </article>
      <article className="media-frame frame-title">
        <span>HUMMINGBIRD / RELEASE 01</span>
        <strong>THE STORY<br />MOVES <em>HERE</em></strong>
      </article>
      <div className="hero-seed"><span>STORY SEED</span><i /></div>
      <svg className="hero-paths" aria-hidden="true" viewBox="0 0 800 800" preserveAspectRatio="none">
        <path className="path-orchid" d="M390 395C285 350 265 240 155 240S34 186 20 120" />
        <path className="path-aqua" d="M397 400C510 342 525 188 696 191s85-118 85-118" />
        <path className="path-coral" d="M400 408C490 473 527 572 680 589s73 127 106 174" />
        <path className="path-muted" d="M388 410C305 465 271 583 119 609S58 739 11 779" />
      </svg>
      <span className="coordinate coordinate-one">18.5204° N</span>
      <span className="coordinate coordinate-two">MOVE / MEASURE / MAKE</span>
    </div>
  );
}

function StoryEngine() {
  const formats = ['REEL', 'SHORT', 'STILL', 'CAROUSEL', 'AUDIO', 'EDITORIAL'];
  return (
    <div className="engine" aria-label="The Story Engine turns a story seed into formats, distribution, signals, and the next creative decision">
      <svg className="engine-lines" aria-hidden="true" viewBox="0 0 1200 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="engineGradient" x1="0" x2="1">
            <stop offset="0" stopColor="#A855F7" />
            <stop offset=".55" stopColor="#FF5C7A" />
            <stop offset="1" stopColor="#36E4DA" />
          </linearGradient>
        </defs>
        <path className="engine-main-line" d="M72 300H270C325 300 318 155 385 155H690C746 155 734 300 790 300H1125" />
        <path d="M318 300C340 300 346 235 385 235H690C725 235 740 300 790 300" />
        <path d="M318 300H790" />
        <path d="M318 300C340 300 346 365 385 365H690C725 365 740 300 790 300" />
        <path d="M318 300C340 300 346 445 385 445H690C746 445 734 300 790 300" />
        <path className="engine-loop" d="M1108 325C1080 548 670 570 310 520 136 496 74 422 72 335" />
      </svg>
      <div className="engine-node engine-seed">
        <span>BUSINESS OBJECTIVE</span>
        <b>One idea<br />worth moving</b>
        <i />
      </div>
      <div className="engine-node engine-story">
        <span>HERO STORY</span>
        <b>The signal<br />gets a shape.</b>
      </div>
      <div className="engine-formats">
        {formats.map((format, index) => <span key={format} style={{ '--format-index': index } as React.CSSProperties}>{format}</span>)}
      </div>
      <div className="engine-node engine-distribute">
        <span>DISTRIBUTION</span>
        <b>Right format.<br />Right moment.</b>
      </div>
      <div className="engine-node engine-signal">
        <span>SIGNAL CAPTURE</span>
        <b>Attention becomes<br />evidence.</b>
        <div className="mini-bars"><i /><i /><i /><i /></div>
      </div>
      <div className="engine-next"><span>NEXT CREATIVE DECISION</span><i>↗</i></div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <header className="site-header">
        <a aria-label="Hummingbird Storyhouse home" href="#top"><BrandMark /></a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#capabilities">Capabilities</a>
          <a href="#originals">Originals</a>
          <a href="#engine">Story Engine</a>
        </nav>
        <a className="header-cta" href="#start">Start a project <span aria-hidden="true">↗</span></a>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-noise" />
          <div className="hero-copy" data-reveal>
            <p className="kicker"><span>H</span> Culture × Storytelling × Media Systems</p>
            <h1>Stories don’t sit still.<br /><em>Neither do we.</em></h1>
            <p className="hero-support">Hummingbird Storyhouse builds stories, media systems, and original worlds designed to move through culture.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#start">Start a project <ArrowIcon /></a>
              <a className="button button-quiet" href="#storyhouse">Enter the Storyhouse <span aria-hidden="true">↓</span></a>
            </div>
            <p className="hero-descriptor">Multimedia company <i /> Strategy <i /> Production <i /> Distribution <i /> Intelligence</p>
          </div>
          <HeroComposition />
          <div className="scroll-cue" aria-hidden="true"><span>SCROLL TO FOLLOW THE SIGNAL</span><i /></div>
        </section>

        <section className="positioning section-pad" id="storyhouse">
          <div className="section-number" aria-hidden="true">01 / 09</div>
          <div className="positioning-lead" data-reveal>
            <p className="kicker">Inside the Storyhouse</p>
            <h2>Not a content factory.<br /><em>A media operating company.</em></h2>
          </div>
          <div className="positioning-copy" data-reveal>
            <p>Great creative should not disappear into a feed. We connect strategy, creative development, production, release, audience intelligence, and learning into one compound media loop.</p>
            <p>The result is work with a point of view—and a system that makes every release more useful than the last.</p>
          </div>
          <div className="operating-loop" aria-label="Strategy, create, produce, release, learn, compound">
            {['STRATEGY', 'CREATE', 'PRODUCE', 'RELEASE', 'LEARN', 'COMPOUND'].map((item, index) => (
              <div key={item} data-reveal><span>0{index + 1}</span><b>{item}</b>{index < 5 && <i aria-hidden="true">→</i>}</div>
            ))}
          </div>
        </section>

        <section className="capabilities section-pad" id="capabilities">
          <div className="section-heading" data-reveal>
            <div><p className="kicker">What we do</p><h2>What moves<br /><em>through the house.</em></h2></div>
            <p>From the first strategic question to the signal that shapes what comes next, every capability works as part of the same living system.</p>
          </div>
          <div className="capability-grid">
            {capabilities.map((capability) => (
              <article className={`capability ${capability.className}`} data-reveal key={capability.title}>
                <span>{capability.number}</span>
                <h3>{capability.title}</h3>
                <p>{capability.copy}</p>
                <i aria-hidden="true">↗</i>
              </article>
            ))}
          </div>
        </section>

        <section className="story-engine-section section-pad" id="engine">
          <div className="section-number" aria-hidden="true">03 / 09</div>
          <div className="engine-heading" data-reveal>
            <p className="kicker">The Story Engine</p>
            <h2>One strong story should not become <em>one asset.</em></h2>
            <p>A core idea can become a film, a voice, a visual language, a conversation, and a feedback loop. We build for the whole journey—not a folder of deliverables.</p>
          </div>
          <StoryEngine />
          <div className="engine-caption">
            <span><i className="dot-orchid" /> One resonant story</span>
            <span><i className="dot-coral" /> Many native expressions</span>
            <span><i className="dot-aqua" /> Intelligence that compounds</span>
          </div>
        </section>

        <section className="worlds section-pad" id="work">
          <div className="section-heading" data-reveal>
            <div><p className="kicker">Built inside the ecosystem</p><h2>Selected<br /><em>worlds in motion.</em></h2></div>
            <p>Living concepts developed within Hummingbird’s ecosystem—each with its own audience, visual language, and potential to grow.</p>
          </div>
          <div className="world-list">
            {worlds.map((world) => (
              <article className={`world ${world.className}`} data-reveal key={world.name}>
                <div className="world-visual" aria-hidden="true">
                  <span className="world-index">{world.index}</span>
                  {world.name === 'TableGrid' && <><div className="plate plate-one" /><div className="plate plate-two" /><div className="table-line" /></>}
                  {world.name === 'VYRAL' && <><div className="pixel-field" /><span className="v-glyph">V</span><div className="scan-line" /></>}
                  {world.name === 'Yaadbody' && <><div className="sun-form" /><div className="body-line" /><span className="yaad-word">BREATHE<br />BACK IN</span></>}
                </div>
                <div className="world-copy">
                  <p>{world.field}</p>
                  <h3>{world.name}</h3>
                  <span>{world.line}</span>
                  <small>Concept in development</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="originals" id="originals">
          <div className="originals-backdrop" aria-hidden="true"><span>ORIGINALS</span></div>
          <div className="originals-inner section-pad">
            <div className="originals-title" data-reveal>
              <p className="kicker">Storyhouse Originals / Chapter 01</p>
              <h2>We don’t only make media for brands.<br /><em>We build media worth owning.</em></h2>
            </div>
            <div className="originals-stage" data-reveal>
              <div className="feature-original">
                <span className="original-state"><i /> IN DEVELOPMENT</span>
                <p>HSH / ORIGINAL 001</p>
                <h3>The spaces<br />between <em>home.</em></h3>
                <div><span>DOCUMENTARY SERIES</span><span>06 × 24 MIN</span><span>2027</span></div>
              </div>
              <div className="originals-note">
                <span>FROM THE DEVELOPMENT DESK</span>
                <p>Original worlds rooted in real curiosity, cultural specificity, and the freedom to find the format the story deserves.</p>
              </div>
            </div>
            <div className="format-marquee" aria-label="Original formats">
              <span>Films</span><i /> <span>Series</span><i /> <span>Podcasts</span><i /> <span>Digital Formats</span><i /> <span>Editorial</span><i /> <span>Experimental</span>
            </div>
          </div>
        </section>

        <section className="signals section-pad" id="signals">
          <div className="signals-copy" data-reveal>
            <p className="kicker">Intelligence / Signals</p>
            <h2>Every release teaches <em>the next one.</em></h2>
            <p>We study how a story behaves after release—not to chase the algorithm, but to understand the audience. Attention becomes insight. Insight sharpens the work.</p>
            <div className="learning-loop">
              {['CREATE', 'MEASURE', 'LEARN', 'IMPROVE'].map((word, index) => <span key={word}>{word}{index < 3 && <i>→</i>}</span>)}
            </div>
          </div>
          <div className="signal-console" data-reveal>
            <div className="console-head"><span>RELEASE SIGNAL / 0047</span><span><i /> LIVE READ</span></div>
            <div className="signal-flow">
              {[
                ['HOOK', '82', 'The opening earns the pause'],
                ['RETENTION', '71', 'The tension holds through turn two'],
                ['SAVES', '38', 'Utility extends the story’s life'],
                ['SHARES', '54', 'Identity makes it travel'],
                ['CONVERSION', '19', 'Intent moves into action'],
                ['AUDIENCE', '↑', 'The next question gets clearer']
              ].map(([label, value, note], index) => (
                <div className="signal-row" key={label}>
                  <span>0{index + 1}</span><b>{label}</b><div><i style={{ width: `${44 + index * 8}%` }} /></div><strong>{value}{value !== '↑' && '%'}</strong><small>{note}</small>
                </div>
              ))}
            </div>
            <div className="console-foot"><span>AUDIENCE RESPONSE IS A CREATIVE INPUT</span><span>HSH.INTEL</span></div>
          </div>
        </section>

        <section className="relationship section-pad">
          <div className="relationship-head" data-reveal>
            <p className="kicker">Working together</p>
            <h2>How brands enter<br /><em>the Storyhouse.</em></h2>
          </div>
          <div className="relationship-steps">
            {relationship.map(([number, title, copy]) => (
              <article data-reveal key={number}>
                <span>{number}</span><h3>{title}</h3><p>{copy}</p><i aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section className="intake section-pad" id="start">
          <div className="intake-copy" data-reveal>
            <p className="kicker">Start a project</p>
            <h2>You have something worth saying.<br /><em>Let’s make it impossible to ignore.</em></h2>
            <p>Bring the ambition, the knotty problem, or the early spark. We’ll start by finding the story at the center of it.</p>
            <div className="intake-contact"><span>NEW BUSINESS / COLLABORATION</span><a href="mailto:hello@hummingbirdstoryhouse.com">hello@hummingbirdstoryhouse.com <span aria-hidden="true">↗</span></a></div>
          </div>
          <div className="intake-panel" data-reveal>
            <div className="form-index"><span>PROJECT INTAKE</span><span>01—06</span></div>
            <IntakeForm />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top"><BrandMark /><p>Culture moves.<br /><em>Stories carry it.</em></p></div>
        <div className="footer-bottom">
          <nav aria-label="Footer navigation"><a href="#work">Work</a><a href="#capabilities">Capabilities</a><a href="#originals">Originals</a><a href="#engine">Story Engine</a><a href="#start">Start a Project</a></nav>
          <span>Multimedia company</span>
          <small>© 2026 Hummingbird Storyhouse</small>
        </div>
      </footer>
    </>
  );
}
