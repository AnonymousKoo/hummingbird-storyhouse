import { BrandMark } from '../components/brand-mark';
import { IntakeForm } from '../components/intake-form';

const capabilities = [
  { number: '01', title: 'Brand, Audience & Marketing Strategy', copy: 'Connect the business outcome, audience need, positioning, offer, and message before the work takes shape.', className: 'cap-strategy' },
  { number: '02', title: 'Creative Development', copy: 'Turn sharp strategy into formats, treatments, scripts, and ideas people choose to spend time with.', className: 'cap-creative' },
  { number: '03', title: 'Video + Multimedia Production', copy: 'Make every frame, sound, and cut earn attention—from a single hero film to a living content universe.', className: 'cap-production' },
  { number: '04', title: 'Creator Partnerships', copy: 'Build credible collaborations around shared audience, taste, and purpose—not borrowed reach.', className: 'cap-creators' },
  { number: '05', title: 'Channel Distribution', copy: 'Engineer the release so the story arrives in the right shape, channel, sequence, and moment.', className: 'cap-distribution' },
  { number: '06', title: 'Growth Marketing', copy: 'Design campaigns, funnel and channel plans, conversion paths, lifecycle touchpoints, and useful experiments around the creative.', className: 'cap-growth' },
  { number: '07', title: 'Audience & Performance Intelligence', copy: 'Read media and business signals together—from attention and retention to intent, leads, conversion, and value.', className: 'cap-intelligence' },
  { number: '08', title: 'Originals & IP', copy: 'Develop owned worlds with the depth to grow across films, series, audio, editorial, and emerging formats.', className: 'cap-originals' }
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
  ['01', 'Brands entering a new chapter', 'Launching, repositioning, expanding, or trying to make a stronger market move than another campaign can solve.'],
  ['02', 'Founders building real demand', 'You need the story, offer, channels, and conversion path to work together—not just a launch asset.'],
  ['03', 'Teams tired of disconnected vendors', 'Strategy, marketing, creative, production, distribution, and measurement should behave like one system.'],
  ['04', 'Creators and properties building something ownable', 'Move beyond feeds and one-off posts toward formats, audiences, partnerships, and enduring media value.']
] as const;

const engagements = [
  {
    number: '01',
    title: 'Build the Brand & Growth System',
    fit: 'New brand · Repositioning · New market',
    outcome: 'Positioning, audience, offer, message, channel architecture, conversion path, and measurement plan.'
  },
  {
    number: '02',
    title: 'Run a Campaign',
    fit: 'Launch · Seasonal push · Product or service growth',
    outcome: 'Campaign strategy, creative system, production, release plan, conversion design, and learning loop.'
  },
  {
    number: '03',
    title: 'Operate the Media Engine',
    fit: 'Ongoing media · Recurring growth · Internal team leverage',
    outcome: 'Continuous planning, production, distribution, performance intelligence, and iteration without becoming a content factory.'
  },
  {
    number: '04',
    title: 'Produce a Story / Release',
    fit: 'Hero film · Series · Podcast · Editorial package',
    outcome: 'Concept-to-release production with the audience, format, distribution, and next action considered from the beginning.'
  },
  {
    number: '05',
    title: 'Build an Original / Partnership',
    fit: 'Owned IP · Creator collaboration · Co-production',
    outcome: 'Development strategy, format, audience, partnership model, and a path toward media Hummingbird or its partners can own.'
  }
] as const;

const relationship = [
  ['01', 'Discover', 'We clarify the business outcome, audience need, cultural opening, and what people should feel or do.'],
  ['02', 'Position', 'We shape the offer, message, conversion path, and channel role into one clear direction.'],
  ['03', 'Build', 'We develop the creative system and produce the story in the formats the idea deserves.'],
  ['04', 'Release', 'We distribute and sequence the campaign for the ways people actually encounter media.'],
  ['05', 'Convert & Learn', 'We read results, understand what moved attention and action, and carry the learning into the next cycle.']
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
      <div className="section-number" aria-hidden="true">05 / 12</div>
      <div className="media-marketing-head" data-reveal>
        <p className="kicker">Media meets marketing</p>
        <h2>Attention is only<br /><em>the beginning.</em></h2>
        <div>
          <p>Media earns the attention. Marketing gives that attention somewhere to go.</p>
          <p>We design the story, audience, offer, channel, call to action, and measurement together from the start—so creative can move people and move business.</p>
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

        <section className="positioning section-pad" id="storyhouse">
          <div className="section-number" aria-hidden="true">01 / 12</div>
          <div className="positioning-lead" data-reveal>
            <p className="kicker">Inside the Storyhouse</p>
            <h2>Not a content factory.<br /><em>A media + marketing operating company.</em></h2>
          </div>
          <div className="positioning-copy" data-reveal>
            <p>Great creative should not disappear into a feed. We connect the business objective, audience, offer, creative, production, distribution, conversion, and learning in one loop.</p>
            <p>The result is work with a point of view—and a system that makes every release more useful than the last.</p>
          </div>
          <div className="operating-loop" aria-label="Position, create, produce, distribute, convert, learn">
            {['POSITION', 'CREATE', 'PRODUCE', 'DISTRIBUTE', 'CONVERT', 'LEARN'].map((item, index) => (
              <div key={item} data-reveal><span>0{index + 1}</span><b>{item}</b>{index < 5 && <i aria-hidden="true">→</i>}</div>
            ))}
          </div>
        </section>

        <section className="thesis section-pad numbered-section" id="why">
          <div className="section-number" aria-hidden="true">02 / 12</div>
          <div className="thesis-copy" data-reveal>
            <p className="kicker">Why Hummingbird exists</p>
            <h2>Five separate rooms.<br /><em>One story to move.</em></h2>
            <p>Most companies split strategy, marketing, creative, production, and measurement across different teams, vendors, and handoffs. Hummingbird was built to make them behave like one system.</p>
          </div>
          <div className="thesis-system" data-reveal aria-label="Strategy, marketing, creative, production, and intelligence converging inside one Storyhouse">
            {['STRATEGY', 'MARKETING', 'CREATIVE', 'PRODUCTION', 'INTELLIGENCE'].map((room, index) => (
              <div className="thesis-room" key={room}><span>0{index + 1}</span><b>{room}</b><i aria-hidden="true">↘</i></div>
            ))}
            <div className="thesis-core"><span>ONE</span><strong>STORYHOUSE</strong><small>Shared objective · shared audience · shared learning</small></div>
          </div>
        </section>

        <section className="fit section-pad numbered-section" id="fit">
          <div className="section-number" aria-hidden="true">03 / 12</div>
          <div className="fit-head" data-reveal>
            <p className="kicker">Who this is for</p>
            <h2>For brands with<br /><em>something to move.</em></h2>
            <p>Hummingbird is most useful when the problem is bigger than “we need content.” The work starts where story, market, audience, and business direction meet.</p>
          </div>
          <div className="fit-grid">
            {audiences.map(([number, title, copy]) => (
              <article data-reveal key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="capabilities section-pad numbered-section" id="capabilities">
          <div className="section-number" aria-hidden="true">04 / 12</div>
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

        <MediaMeetsMarketing />

        <section className="engagements section-pad numbered-section" id="engagements">
          <div className="section-number" aria-hidden="true">06 / 12</div>
          <div className="engagements-head" data-reveal>
            <p className="kicker">Ways to work with Hummingbird</p>
            <h2>Buy the outcome.<br /><em>Not a pile of posts.</em></h2>
            <p>Every engagement has a clear job to do. The scope changes, but the operating idea stays the same: connect the story to the audience, the release, the action, and the learning.</p>
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
          <div className="section-number" aria-hidden="true">07 / 12</div>
          <div className="engine-heading" data-reveal>
            <p className="kicker">The Story Engine</p>
            <h2>One strong story should not become <em>one asset.</em></h2>
            <p>A business objective and audience need can become a story, a release system, a clear action, and a learning loop. We build the whole journey—not a folder of deliverables.</p>
          </div>
          <StoryEngine />
          <div className="engine-caption">
            <span><i className="dot-orchid" /> One resonant story</span>
            <span><i className="dot-coral" /> Many native expressions</span>
            <span><i className="dot-aqua" /> Intelligence that compounds</span>
          </div>
        </section>

        <section className="worlds section-pad numbered-section" id="work">
          <div className="section-number" aria-hidden="true">08 / 12</div>
          <div className="section-heading" data-reveal>
            <div><p className="kicker">Proof in motion / internal venture lab</p><h2>We test the system<br /><em>on worlds we can touch.</em></h2></div>
            <p>Before we present polished client case studies, Hummingbird is using its own ecosystem as the laboratory. These are internal ventures—not external client claims—and each one gives the Storyhouse a place to prove its thinking in real operations.</p>
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
                  <dl className="world-proof">
                    <div><dt>Hummingbird role</dt><dd>{world.role}</dd></div>
                    <div><dt>Status</dt><dd>{world.status}</dd></div>
                  </dl>
                  <small>Case study in development</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="originals numbered-section" id="originals">
          <div className="section-number originals-number" aria-hidden="true">09 / 12</div>
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

        <section className="signals section-pad numbered-section" id="signals">
          <div className="section-number" aria-hidden="true">10 / 12</div>
          <div className="signals-copy" data-reveal>
            <p className="kicker">Intelligence / Signals</p>
            <h2>Every release teaches <em>the next one.</em></h2>
            <p>We evaluate how the media behaves and what it helps the business do. Attention, retention, intent, leads, conversion, and value become inputs for the next creative and marketing decision.</p>
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

        <section className="relationship section-pad numbered-section">
          <div className="section-number" aria-hidden="true">11 / 12</div>
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

        <section className="intake section-pad numbered-section" id="start">
          <div className="section-number" aria-hidden="true">12 / 12</div>
          <div className="intake-copy" data-reveal>
            <p className="kicker">Start a project</p>
            <h2>You have something worth saying.<br /><em>Let’s make it impossible to ignore.</em></h2>
            <p>Bring the business outcome, growth ambition, knotty problem, or early spark. We’ll start by finding the audience and story at the center of it.</p>
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
          <nav aria-label="Footer navigation"><a href="#why">Why Hummingbird</a><a href="#capabilities">Capabilities</a><a href="#engagements">Ways to work</a><a href="#work">Proof</a><a href="#originals">Originals</a><a href="#start">Start a Project</a></nav>
          <span>Media + marketing company</span>
          <small>© 2026 Hummingbird Storyhouse</small>
        </div>
      </footer>
    </>
  );
}
