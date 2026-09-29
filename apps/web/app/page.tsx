import { BrandMark } from '../components/brand-mark';
import { IntakeForm } from '../components/intake-form';

const capabilities = [
  { number: '01', title: 'Brand, Audience & Marketing Strategy', copy: 'Audience. Positioning. Offer. Message.', className: 'cap-strategy' },
  { number: '02', title: 'Creative Development', copy: 'Concepts. Scripts. Formats. Treatments.', className: 'cap-creative' },
  { number: '03', title: 'Video + Multimedia Production', copy: 'Film. Social. Audio. Editorial.', className: 'cap-production' },
  { number: '04', title: 'Creator Partnerships', copy: 'Collaborations built around fit—not reach.', className: 'cap-creators' },
  { number: '05', title: 'Channel Distribution', copy: 'Right format. Right channel. Right moment.', className: 'cap-distribution' },
  { number: '06', title: 'Growth Marketing', copy: 'Funnels. Lifecycle. Experiments. Conversion.', className: 'cap-growth' },
  { number: '07', title: 'Audience & Performance Intelligence', copy: 'Attention → intent → value.', className: 'cap-intelligence' },
  { number: '08', title: 'Originals & IP', copy: 'Owned formats. Series. Worlds. IP.', className: 'cap-originals' }
] as const;

const worlds = [
  {
    name: 'TableGrid',
    index: 'WORLD 01',
    field: 'Food / Network / Brand storytelling',
    line: 'A living table for the people, rituals, and ideas shaping how culture eats.',
    role: 'Positioning · narrative system · food media',
    status: 'Internal venture laboratory',
    className: 'world-tablegrid'
  },
  {
    name: 'VYRAL',
    index: 'WORLD 02',
    field: 'Gaming / Community / Entertainment',
    line: 'Competitive energy and community stories, designed beyond the highlight reel.',
    role: 'Brand world · community media · entertainment',
    status: 'Internal venture laboratory',
    className: 'world-vyral'
  },
  {
    name: 'Yaadbody',
    index: 'WORLD 03',
    field: 'Wellness / Education / Lifestyle',
    line: 'A grounded, culturally fluent world for feeling well and living whole.',
    role: 'Brand system · education · lifestyle storytelling',
    status: 'Internal venture laboratory',
    className: 'world-yaadbody'
  }
] as const;

const audiences = [
  ['01', 'Brands entering a new chapter'],
  ['02', 'Founders building real demand'],
  ['03', 'Teams done with disconnected vendors'],
  ['04', 'Creators building something ownable']
] as const;

const engagements = [
  {
    number: '01',
    title: 'Build the Brand & Growth System',
    fit: 'New brand · Repositioning · New market',
    outcome: 'Positioning · audience · offer · channels · conversion'
  },
  {
    number: '02',
    title: 'Run a Campaign',
    fit: 'Launch · Seasonal push · Product or service growth',
    outcome: 'Strategy · creative · production · release · learning'
  },
  {
    number: '03',
    title: 'Operate the Media Engine',
    fit: 'Ongoing media · Recurring growth · Internal team leverage',
    outcome: 'Planning · production · distribution · optimization'
  },
  {
    number: '04',
    title: 'Produce a Story / Release',
    fit: 'Hero film · Series · Podcast · Editorial package',
    outcome: 'Concept · production · format · distribution'
  },
  {
    number: '05',
    title: 'Build an Original / Partnership',
    fit: 'Owned IP · Creator collaboration · Co-production',
    outcome: 'Format · audience · partnership · ownership'
  }
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
        <div><span className="signal-live"><i /> SIGNAL MODEL</span><b>HOLD</b></div>
        <p>Attention becomes evidence</p>
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
    <div className="engine" aria-label="The Story Engine connects a business objective, audience and offer, hero story, native formats, distribution, action, signals, and the next creative and marketing decision">
      <svg className="engine-lines" aria-hidden="true" viewBox="0 0 1200 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="engineGradient" x1="0" x2="1">
            <stop offset="0" stopColor="#A855F7" />
            <stop offset=".55" stopColor="#FF5C7A" />
            <stop offset="1" stopColor="#36E4DA" />
          </linearGradient>
        </defs>
        <path className="engine-main-line" d="M45 300C135 300 120 150 220 150S315 300 400 300 480 150 565 150 650 300 735 300H1145" />
        <path d="M510 300C535 265 535 235 565 220H650C680 235 680 265 705 300" />
        <path d="M510 300H705" />
        <path d="M510 300C535 335 535 365 565 380H650C680 365 680 335 705 300" />
        <path d="M510 300C535 405 555 455 610 455S680 405 705 300" />
        <path className="engine-loop" d="M1108 325C1080 548 670 570 310 520 136 496 74 422 72 335" />
      </svg>
      <div className="engine-node engine-seed">
        <span>BUSINESS OBJECTIVE</span>
        <b>A result<br />worth moving.</b>
        <i />
      </div>
      <div className="engine-node engine-audience">
        <span>AUDIENCE + OFFER</span>
        <b>A real need.<br />A clear next step.</b>
      </div>
      <div className="engine-node engine-story">
        <span>HERO STORY</span>
        <b>The strategy<br />gets a pulse.</b>
      </div>
      <div className="engine-formats">
        {formats.map((format, index) => <span key={format} style={{ '--format-index': index } as React.CSSProperties}>{format}</span>)}
      </div>
      <div className="engine-node engine-distribute">
        <span>DISTRIBUTION</span>
        <b>Right format.<br />Right moment.</b>
      </div>
      <div className="engine-node engine-action">
        <span>ACTION / CONVERSION</span>
        <b>Attention finds<br />somewhere to go.</b>
      </div>
      <div className="engine-node engine-signal">
        <span>MEDIA + BUSINESS SIGNALS</span>
        <b>Response becomes<br />evidence.</b>
        <div className="mini-bars"><i /><i /><i /><i /></div>
      </div>
      <div className="engine-next"><span>NEXT CREATIVE / MARKETING DECISION</span><i>↗</i></div>
    </div>
  );
}

function MediaMeetsMarketing() {
  const stages = ['AWARENESS', 'CONSIDERATION', 'CONVERSION', 'RETENTION'];
  const channels = ['SOCIAL', 'SEARCH', 'EMAIL', 'CREATOR', 'PARTNERSHIPS', 'PAID', 'WEB'];
  const outcomes = ['AUDIENCE', 'QUALIFIED LEADS', 'BOOKINGS', 'SIGNUPS', 'PURCHASES', 'RETENTION'];
  return (
    <section className="media-marketing section-pad" id="media-marketing">
      <div className="section-number" aria-hidden="true">03 / 09</div>
      <div className="media-marketing-head" data-reveal>
        <p className="kicker">Media meets marketing</p>
        <h2>Attention is only<br /><em>the beginning.</em></h2>
        <div>
          <p>Media earns attention. Marketing turns it into action.</p>
        </div>
      </div>
      <div className="journey-field" data-reveal aria-label="Media and marketing journey from awareness through retention, surrounded by channels and connected to business outcomes">
        <div className="journey-label">STORY × AUDIENCE × OFFER × ACTION</div>
        <div className="channel-signals" aria-label="Channels">{channels.map((channel) => <span key={channel}>{channel}</span>)}</div>
        <div className="journey-stages">
          {stages.map((stage, index) => <div key={stage}><small>0{index + 1}</small><strong>{stage}</strong>{index < stages.length - 1 && <i aria-hidden="true">→</i>}</div>)}
        </div>
        <div className="outcome-signals"><span>OUTCOMES</span>{outcomes.map((outcome) => <b key={outcome}>{outcome}</b>)}</div>
      </div>
    </section>
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
          <a href="#engagements">Ways to work</a>
          <a href="#engine">Story Engine</a>
        </nav>
        <a className="header-cta" href="#start">Start a project <span aria-hidden="true">↗</span></a>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-noise" />
          <div className="hero-copy" data-reveal>
            <p className="kicker"><span>H</span> Culture × Storytelling × Marketing Systems</p>
            <h1>Stories don’t sit still.<br /><em>Neither do we.</em></h1>
            <p className="hero-support">Hummingbird Storyhouse builds stories, campaigns, media systems, and growth loops designed to move people and move business.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#start">Start a project <ArrowIcon /></a>
              <a className="button button-quiet" href="#storyhouse">Enter the Storyhouse <span aria-hidden="true">↓</span></a>
            </div>
            <p className="hero-descriptor">Media + marketing company <i /> Strategy <i /> Creative <i /> Production <i /> Distribution <i /> Growth Intelligence</p>
          </div>
          <HeroComposition />
          <div className="scroll-cue" aria-hidden="true"><span>SCROLL TO FOLLOW THE SIGNAL</span><i /></div>
        </section>

        <section className="positioning section-pad numbered-section" id="storyhouse">
          <div className="section-number" aria-hidden="true">01 / 09</div>
          <div className="positioning-lead" data-reveal>
            <p className="kicker">Inside the Storyhouse</p>
            <h2>Not a content factory.<br /><em>One Storyhouse.</em></h2>
          </div>
          <div className="positioning-copy" data-reveal>
            <p>Strategy, marketing, creative, production, distribution, and intelligence—moving as one system.</p>
          </div>
          <div className="operating-loop" aria-label="Position, create, produce, distribute, convert, learn">
            {['POSITION', 'CREATE', 'PRODUCE', 'DISTRIBUTE', 'CONVERT', 'LEARN'].map((item, index) => (
              <div key={item} data-reveal><span>0{index + 1}</span><b>{item}</b>{index < 5 && <i aria-hidden="true">→</i>}</div>
            ))}
          </div>
          <div className="audience-strip" data-reveal>
            <span>BUILT FOR</span>
            {audiences.map(([number, title]) => <b key={number}>{title}</b>)}
          </div>
        </section>

        <section className="capabilities section-pad numbered-section" id="capabilities">
          <div className="section-number" aria-hidden="true">02 / 09</div>
          <div className="section-heading" data-reveal>
            <div><p className="kicker">What we do</p><h2>What moves<br /><em>through the house.</em></h2></div>
            <p>One house. Eight capabilities. No disconnected handoffs.</p>
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

        <MediaMeetsMarketing />

        <section className="engagements section-pad numbered-section" id="engagements">
          <div className="section-number" aria-hidden="true">04 / 09</div>
          <div className="engagements-head" data-reveal>
            <p className="kicker">Ways to work with Hummingbird</p>
            <h2>Buy the outcome.<br /><em>Not a pile of posts.</em></h2>
            <p>Choose the move. We build the system around it.</p>
          </div>
          <div className="engagement-list">
            {engagements.map((engagement) => (
              <article data-reveal key={engagement.number}>
                <span>{engagement.number}</span>
                <div><h3>{engagement.title}</h3><small>{engagement.fit}</small></div>
                <p>{engagement.outcome}</p>
                <a href="#start" aria-label={'Start a project for ' + engagement.title}>Start here <i aria-hidden="true">↗</i></a>
              </article>
            ))}
          </div>
        </section>

        <section className="story-engine-section section-pad" id="engine">
          <div className="section-number" aria-hidden="true">05 / 09</div>
          <div className="engine-heading" data-reveal>
            <p className="kicker">The Story Engine</p>
            <h2>One strong story should not become <em>one asset.</em></h2>
            <p>Objective → story → formats → action → signal → next move.</p>
          </div>
          <StoryEngine />
          <div className="engine-caption">
            <span><i className="dot-orchid" /> One resonant story</span>
            <span><i className="dot-coral" /> Many native expressions</span>
            <span><i className="dot-aqua" /> Intelligence that compounds</span>
          </div>
        </section>

        <section className="worlds section-pad numbered-section" id="work">
          <div className="section-number" aria-hidden="true">06 / 09</div>
          <div className="section-heading" data-reveal>
            <div><p className="kicker">Internal venture lab</p><h2>Proof starts<br /><em>inside the ecosystem.</em></h2></div>
            <p>Real ventures. Real operating ground. Case studies in motion.</p>
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
                  <div className="world-tags"><b>{world.role}</b><small>{world.status}</small></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="originals numbered-section" id="originals">
          <div className="section-number originals-number" aria-hidden="true">07 / 09</div>
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
                <p>Original worlds built to be owned, extended, and remembered.</p>
              </div>
            </div>
            <div className="format-marquee" aria-label="Original formats">
              <span>Films</span><i /> <span>Series</span><i /> <span>Podcasts</span><i /> <span>Digital Formats</span><i /> <span>Editorial</span><i /> <span>Experimental</span>
            </div>
          </div>
        </section>

        <section className="signals section-pad numbered-section" id="signals">
          <div className="section-number" aria-hidden="true">08 / 09</div>
          <div className="signals-copy" data-reveal>
            <p className="kicker">Intelligence / Signals</p>
            <h2>Every release teaches <em>the next one.</em></h2>
            <p>Media signal → business signal → next move.</p>
            <div className="learning-loop">
              {['CREATE', 'MEASURE', 'LEARN', 'IMPROVE'].map((word, index) => <span key={word}>{word}{index < 3 && <i>→</i>}</span>)}
            </div>
          </div>
          <div className="signal-console" data-reveal>
            <div className="console-head"><span>ILLUSTRATIVE SIGNAL MODEL</span><span><i /> MEDIA + BUSINESS</span></div>
            <div className="signal-flow">
              {[
                ['ATTENTION', 'EARN', 'The opening earns a relevant pause'],
                ['RETENTION', 'HOLD', 'The story sustains meaningful interest'],
                ['INTENT', 'SEEK', 'People look for the next detail'],
                ['LEADS', 'QUALIFY', 'Interest becomes a useful relationship'],
                ['CONVERSION', 'ACT', 'A clear path turns intent into action'],
                ['VALUE', 'LEARN', 'Business response sharpens the next cycle']
              ].map(([label, state, note], index) => (
                <div className="signal-row" key={label}>
                  <span>0{index + 1}</span><b>{label}</b><div><i style={{ width: `${44 + index * 8}%` }} /></div><strong>{state}</strong><small>{note}</small>
                </div>
              ))}
            </div>
            <div className="console-foot"><span>RESPONSE IS A CREATIVE + MARKETING INPUT</span><span>HSH.INTEL</span></div>
          </div>
        </section>

        <section className="intake section-pad numbered-section" id="start">
          <div className="section-number" aria-hidden="true">09 / 09</div>
          <div className="intake-copy" data-reveal>
            <p className="kicker">Start a project</p>
            <h2>You have something worth saying.<br /><em>Let’s make it impossible to ignore.</em></h2>
            <p>Bring the outcome. We’ll find the story and the system.</p>
            <div className="process-strip" aria-label="Discover, position, build, release, learn">
              {['DISCOVER', 'POSITION', 'BUILD', 'RELEASE', 'LEARN'].map((step, index) => <span key={step}>0{index + 1} {step}</span>)}
            </div>
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
          <nav aria-label="Footer navigation"><a href="#capabilities">Capabilities</a><a href="#engagements">Ways to work</a><a href="#work">Proof</a><a href="#start">Start a Project</a></nav>
          <span>Media + marketing company</span>
          <small>© 2026 Hummingbird Storyhouse</small>
        </div>
      </footer>
    </>
  );
}
