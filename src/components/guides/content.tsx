import React from 'react';
import { guideUrl } from '../../seo/site';

export interface GuideContent {
  h1: string;
  lead: string;
  body: React.ReactNode;
  faq: { q: string; a: string }[];
}

const L: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <a href={guideUrl(to)}>{children}</a>
);

/* ─── Ankitti vs Anki ─── */

const ankiAlternative: GuideContent = {
  h1: 'A gentler Anki alternative',
  lead:
    'Ankitti keeps what makes Anki work, the SM-2 schedule and the .apkg deck format, and changes the parts that get in the way. Here is an honest side-by-side, including what Anki still does better.',
  body: (
    <>
      <h2>What stays the same</h2>
      <p>
        If you already use Anki, nothing about the method changes. Ankitti schedules cards with an Anki-style version of{' '}
        <L to="sm2-algorithm">the SM-2 algorithm</L>: new cards go through short learning steps (1 minute, then 10 minutes),
        graduate to a 1-day interval, and then every <em>Good</em> multiplies the gap by the card’s ease, which starts at 2.5.
      </p>
      <ul>
        <li>The same four buttons: Again, Hard, Good and Easy.</li>
        <li>The same deck files. Ankitti <L to="open-apkg-file">opens .apkg packages</L> exported from Anki.</li>
        <li>Cloze deletions with the same <code>{'{{c1::answer::hint}}'}</code> syntax.</li>
        <li>Keyboard-first reviews: Space shows the answer, 1 to 4 rates it.</li>
      </ul>

      <h2>What is different</h2>
      <h3>You can review whenever you want</h3>
      <p>
        When Anki says “Congratulations! You have finished this deck for now”, getting more practice means building a Custom
        Study session. In Ankitti every deck has a <strong>Relearn</strong> button. Drill it the night before an exam as many
        times as you like; your real schedule is left alone.
      </p>
      <h3>Nothing to install</h3>
      <p>
        Ankitti runs in a browser tab on Windows, macOS, Linux, ChromeOS, iPhone and Android. You can add it to your home
        screen and it keeps working offline, like an app.
      </p>
      <h3>Free on iPhone too</h3>
      <p>
        Anki is free on desktop and Android, and AnkiMobile for iPhone and iPad is a paid app that funds Anki’s development.
        Ankitti is free on every device.
      </p>
      <h3>Drafts are saved as you type</h3>
      <p>
        Every keystroke in the card editor is kept. Close the tab halfway through a card and it is waiting when you come back.
      </p>
      <h3>Decks from a topic</h3>
      <p>
        Type a subject and Ankitti drafts a deck you can edit before you study. It is a starting point, not a replacement for
        writing your own cards, which is still the best way to learn.
      </p>
      <h3>It is soft to look at</h3>
      <p>
        Pastel colours, rounded type and a few cat ears. If you open your flashcards more often because they are nice to look
        at, that is the whole point.
      </p>

      <h2>Side by side</h2>
      <div className="gp-table-wrap">
        <table>
          <thead>
            <tr><th scope="col" /><th scope="col">Anki</th><th scope="col">Ankitti</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">Price</th><td>Free on desktop and Android, paid on iPhone</td><td>Free everywhere</td></tr>
            <tr><th scope="row">Runs in</th><td>Desktop and mobile apps, plus AnkiWeb</td><td>Any modern browser, installable</td></tr>
            <tr><th scope="row">Extra reviews</th><td>Custom Study session</td><td>Relearn button on every deck</td></tr>
            <tr><th scope="row">Scheduler</th><td>SM-2 variant or FSRS</td><td>Anki-style SM-2</td></tr>
            <tr><th scope="row">Deck format</th><td>.apkg, .colpkg, text</td><td>Imports .apkg, .csv, .tsv, .json</td></tr>
            <tr><th scope="row">Add-ons</th><td>Thousands</td><td>None</td></tr>
            <tr><th scope="row">AI deck drafts</th><td>Through add-ons</td><td>Built in</td></tr>
          </tbody>
        </table>
      </div>

      <h2>What Anki still does better</h2>
      <p>Ankitti is younger and smaller. Stay with Anki, or use both, if you depend on any of these:</p>
      <ul>
        <li><strong>Add-ons.</strong> Anki has a huge library of community add-ons for everything from heatmaps to image occlusion.</li>
        <li><strong>FSRS.</strong> Since version 23.10 Anki can schedule with FSRS, a newer model fitted to your own review history.</li>
        <li><strong>Shared decks.</strong> AnkiWeb hosts thousands of ready-made decks. You can still download them there and import the .apkg into Ankitti.</li>
        <li><strong>Media in imported decks.</strong> Ankitti brings over text, cloze, tags and review history. Images and audio inside an .apkg are not imported yet.</li>
        <li><strong>Years of polish.</strong> Anki has been developed since 2006 and its sync is battle-tested.</li>
      </ul>

      <h2>Move a deck over in two minutes</h2>
      <ol>
        <li>In Anki on your computer, choose <strong>File → Export…</strong></li>
        <li>Pick <strong>Anki Deck Package (*.apkg)</strong>, choose the deck, and tick <strong>Include scheduling information</strong> so your intervals come along.</li>
        <li>Open <a href="/">Ankitti</a>, choose <strong>Import</strong> and select the file.</li>
        <li>Press Space on the first card. That is it.</li>
      </ol>
    </>
  ),
  faq: [
    {
      q: 'Is Ankitti made by the people who make Anki?',
      a: 'No. Ankitti is an independent project. Anki is developed by Damien Elmes and the Anki community, and Ankitti simply reads the same deck format and uses the same style of scheduling.',
    },
    {
      q: 'Will my intervals carry over from Anki?',
      a: 'Yes, if you export with “Include scheduling information”. Each card keeps its interval, ease, review count and lapses, so nothing resets.',
    },
    {
      q: 'Does Ankitti support FSRS?',
      a: 'Not at the moment. Ankitti uses an Anki-style SM-2 scheduler with learning steps, four buttons and ease factors.',
    },
    {
      q: 'Is Ankitti really free?',
      a: 'Yes. There is no subscription and no ads, on desktop or on phones.',
    },
  ],
};

/* ─── Open an .apkg file ─── */

const openApkg: GuideContent = {
  h1: 'Open an .apkg file in your browser',
  lead:
    'An .apkg file is an Anki deck package. You do not need Anki installed to study one: Ankitti opens it in a browser tab, for free, and unpacks it on your own device.',
  body: (
    <>
      <h2>How to open it, step by step</h2>
      <ol>
        <li>Go to <a href="/">ankitti.com</a> and choose <strong>Import an Anki deck</strong>.</li>
        <li>Select your <code>.apkg</code> file. It works in Chrome, Edge, Firefox and Safari, including on iPhone and Android.</li>
        <li>Ankitti unpacks the deck on your device and adds it to your decks.</li>
        <li>Open the deck and press Space to start reviewing.</li>
      </ol>

      <h2>What is inside an .apkg file</h2>
      <p>
        An .apkg is a ZIP archive with a small database inside. Rename one to <code>.zip</code> and you will see:
      </p>
      <ul>
        <li>
          <strong>The collection database.</strong> A SQLite file called <code>collection.anki2</code> in older packages,{' '}
          <code>collection.anki21</code> from Anki 2.1, or <code>collection.anki21b</code> in packages from Anki 2.1.50 onwards,
          which is compressed with Zstandard. It holds the notes (your card text), the cards and their scheduling.
        </li>
        <li><strong>A file called <code>media</code></strong> that maps numbered files to their real names.</li>
        <li><strong>The numbered media files</strong> themselves: images and sounds used on the cards.</li>
      </ul>
      <p>Ankitti reads all three database versions, so packages from old and new Anki releases both open.</p>

      <h2>What comes across</h2>
      <div className="gp-table-wrap">
        <table>
          <thead><tr><th scope="col">Part of the deck</th><th scope="col">Imported</th></tr></thead>
          <tbody>
            <tr><th scope="row">Front and back text</th><td>Yes</td></tr>
            <tr><th scope="row">Cloze deletions</th><td>Yes</td></tr>
            <tr><th scope="row">Tags</th><td>Yes</td></tr>
            <tr><th scope="row">Interval, ease, reviews and lapses</th><td>Yes, when exported with scheduling</td></tr>
            <tr><th scope="row">Images and audio</th><td>Not yet</td></tr>
          </tbody>
        </table>
      </div>

      <h2>How to export an .apkg from Anki</h2>
      <ol>
        <li>Open Anki on your computer and choose <strong>File → Export…</strong></li>
        <li>Set the format to <strong>Anki Deck Package (*.apkg)</strong> and pick the deck.</li>
        <li>Tick <strong>Include scheduling information</strong> if you want to keep your progress.</li>
        <li>Press <strong>Export</strong> and save the file somewhere easy to find.</li>
      </ol>
      <p>
        Shared decks from AnkiWeb download as .apkg files already, so you can import them straight away.
      </p>

      <h2>Other formats</h2>
      <p>
        No .apkg? Ankitti also imports <code>.csv</code> and <code>.tsv</code> files with the front in the first column and the
        back in the second, and <code>.json</code> exports. A spreadsheet saved as CSV is often the quickest way to turn a
        vocabulary list into a deck.
      </p>

      <h2>If the file will not open</h2>
      <ul>
        <li><strong>It ends in .colpkg.</strong> That is a whole-collection backup. In Anki, export the deck you want as an .apkg instead.</li>
        <li><strong>It says the archive is damaged.</strong> The download probably stopped early. Download or export it again.</li>
        <li><strong>The cards look like code.</strong> Some decks use heavy custom templates. The text still imports; styling from the template does not.</li>
      </ul>
      <p>
        New to flashcards? Start with <L to="spaced-repetition">what spaced repetition is</L>, or read{' '}
        <L to="anki-alternative">how Ankitti compares to Anki</L>.
      </p>
    </>
  ),
  faq: [
    {
      q: 'Can I open an .apkg file without Anki?',
      a: 'Yes. Ankitti opens .apkg files in any modern browser, on a computer or a phone, without installing anything.',
    },
    {
      q: 'Is my deck uploaded to read it?',
      a: 'No. The .apkg is unpacked inside your browser using WebAssembly. Nothing has to be uploaded to read the file.',
    },
    {
      q: 'Can I open an .apkg file on an iPhone?',
      a: 'Yes. Open ankitti.com in Safari, choose Import and pick the file from the Files app.',
    },
    {
      q: 'Can I edit the cards after importing?',
      a: 'Yes. Every imported card can be edited, tagged or deleted in the card browser.',
    },
  ],
};

/* ─── SM-2 ─── */

const sm2: GuideContent = {
  h1: 'The SM-2 algorithm, explained',
  lead:
    'SM-2 is the scheduling rule behind Anki and most flashcard apps. It fits on an index card: one number for how easy a card is, one for how long to wait, and a multiplication.',
  body: (
    <>
      <h2>Where SM-2 comes from</h2>
      <p>
        Piotr Woźniak wrote SM-2 in 1987 for SuperMemo, one of the first spaced repetition programs. Later SuperMemo versions
        moved on to more complex models, but SM-2 was published, simple and good enough, so it became the default almost
        everywhere else, Anki included.
      </p>

      <h2>The original rules</h2>
      <p>After each review you grade your answer from 0 (blackout) to 5 (perfect). Every card carries two numbers:</p>
      <ul>
        <li><strong>The interval</strong>, how many days until the next review.</li>
        <li><strong>The easiness factor (EF)</strong>, which starts at 2.5 and never drops below 1.3.</li>
      </ul>
      <p>Then:</p>
      <ol>
        <li>If the grade is below 3, start the card over: the next interval is 1 day.</li>
        <li>Otherwise the first interval is 1 day, the second is 6 days, and every later one is the previous interval times EF.</li>
        <li>After every review, update EF with <code>EF + (0.1 − (5 − q) × (0.08 + (5 − q) × 0.02))</code>.</li>
      </ol>
      <p>That formula looks fussy, but it just nudges the ease up or down by a fixed amount for each grade:</p>
      <div className="gp-table-wrap">
        <table>
          <thead><tr><th scope="col">Grade</th><th scope="col">Change to EF</th></tr></thead>
          <tbody>
            <tr><th scope="row">5, perfect</th><td>+0.10</td></tr>
            <tr><th scope="row">4, after a pause</th><td>0</td></tr>
            <tr><th scope="row">3, with difficulty</th><td>−0.14</td></tr>
            <tr><th scope="row">2</th><td>−0.32</td></tr>
            <tr><th scope="row">1</th><td>−0.54</td></tr>
            <tr><th scope="row">0, blackout</th><td>−0.80</td></tr>
          </tbody>
        </table>
      </div>

      <h2>The Anki-style version</h2>
      <p>
        Anki and Ankitti keep the core idea, interval times ease, and change the edges. There are four buttons instead of six
        grades, and new cards go through short learning steps before they ever get a day-long interval.
      </p>
      <div className="gp-table-wrap">
        <table>
          <thead><tr><th scope="col">Button</th><th scope="col">Next interval</th><th scope="col">Ease</th></tr></thead>
          <tbody>
            <tr><th scope="row">Again</th><td>Back to the learning steps</td><td>−0.20</td></tr>
            <tr><th scope="row">Hard</th><td>Interval × 1.2</td><td>−0.15</td></tr>
            <tr><th scope="row">Good</th><td>Interval × ease</td><td>No change</td></tr>
            <tr><th scope="row">Easy</th><td>Interval × ease × 1.3</td><td>+0.15</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Ankitti’s defaults are learning steps of 1 and 10 minutes, a graduating interval of 1 day, an easy interval of 4 days, a
        starting ease of 2.5, a minimum of 1.3, and a maximum interval of 36,500 days. Each deck can change them.
      </p>

      <h2>One card on a good run</h2>
      <p>Press Good every time and a new card is shown at these gaps:</p>
      <div className="gp-table-wrap">
        <table>
          <thead><tr><th scope="col">Review</th><th scope="col">Next gap</th><th scope="col">Why</th></tr></thead>
          <tbody>
            <tr><th scope="row">1st</th><td>10 minutes</td><td>Second learning step</td></tr>
            <tr><th scope="row">2nd</th><td>1 day</td><td>Graduates</td></tr>
            <tr><th scope="row">3rd</th><td>3 days</td><td>1 × 2.5, rounded</td></tr>
            <tr><th scope="row">4th</th><td>8 days</td><td>3 × 2.5, rounded</td></tr>
            <tr><th scope="row">5th</th><td>20 days</td><td>8 × 2.5</td></tr>
            <tr><th scope="row">6th</th><td>50 days</td><td>20 × 2.5</td></tr>
            <tr><th scope="row">7th</th><td>125 days</td><td>50 × 2.5</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Seven reviews carry a fact past four months. Once an interval reaches 21 days the card counts as <em>mature</em>.
      </p>

      <h2>What a miss does</h2>
      <p>
        Say the card is on a 20-day interval and you press Again. Its ease drops from 2.50 to 2.30 and it goes back through the
        short steps. When it climbs again, each gap grows by 2.3× instead of 2.5×, so a card you find hard is shown a little
        more often from then on. That is the whole trick: hard cards earn more reviews, easy cards fade into the background.
      </p>

      <h2>The Good button in code</h2>
      <pre><code>{`function good(card) {
  const next = Math.round(card.interval * card.ease);
  // never schedule Good sooner than Hard would
  const hard = Math.round(card.interval * 1.2);
  card.interval = Math.min(36500, Math.max(hard + 1, next));
  card.due = Date.now() + card.interval * 86_400_000;
  return card;
}`}</code></pre>

      <h2>SM-2 or FSRS?</h2>
      <p>
        FSRS is a newer scheduler that fits a memory model to your own review history, and Anki has offered it since version
        23.10. Its supporters report fewer reviews for the same recall. SM-2 is simpler and completely predictable: you can work
        out every interval by hand, as above. For most learners the bigger win is reviewing every day, whichever scheduler you
        use. New to the idea? Read <L to="spaced-repetition">what spaced repetition is</L>.
      </p>
    </>
  ),
  faq: [
    {
      q: 'What does the ease factor mean in SM-2?',
      a: 'It is the multiplier between one interval and the next. A card with ease 2.5 waits 2.5 times longer after each successful review. Hard answers lower it, easy answers raise it.',
    },
    {
      q: 'Why is the minimum ease 1.3?',
      a: 'Below about 1.3 intervals grow so slowly that a difficult card would be shown almost daily forever. Woźniak found that such cards are better rewritten than reviewed more.',
    },
    {
      q: 'Why does original SM-2 use 6 days for the second interval?',
      a: 'It was an empirical choice from Woźniak’s own experiments in the 1980s. The Anki-style variant replaces it with learning steps and a graduating interval you can change.',
    },
  ],
};

/* ─── Spaced repetition ─── */

const spaced: GuideContent = {
  h1: 'What is spaced repetition?',
  lead:
    'Spaced repetition means reviewing something just as you are about to forget it. Each successful recall makes the memory last longer, so the gaps between reviews keep growing.',
  body: (
    <>
      <h2>The forgetting curve</h2>
      <p>
        In 1885 Hermann Ebbinghaus memorised lists of nonsense syllables and tested himself at different delays. He found that
        forgetting is steep at first and then levels off: much of a new list was gone within a day, and what survived faded far
        more slowly. Reviewing at the right moment resets the curve and makes it flatter each time.
      </p>

      <h2>Why spacing beats cramming</h2>
      <p>
        Studying the same thing in several short sessions, spread over days, leads to better long-term memory than one long
        session. This is the <strong>spacing effect</strong>, and it is one of the most replicated results in memory research.
        Cramming can get you through tomorrow’s test; spacing is what you still know next month.
      </p>

      <h2>Testing yourself beats rereading</h2>
      <p>
        Pulling an answer out of memory strengthens it more than looking at it again. In a well-known 2006 study, Roediger and
        Karpicke found that students who practised recalling a text remembered more a week later than students who reread it,
        even though rereading felt more effective at the time. Flashcards turn every review into a small test.
      </p>

      <h2>How an app schedules it for you</h2>
      <p>
        You could space reviews by hand with paper cards and boxes (the Leitner system), but software does it for every card
        individually. After each answer you rate how well you remembered, and the app picks the next date. Ankitti uses{' '}
        <L to="sm2-algorithm">the SM-2 algorithm</L>: remember a card and its gap is multiplied, forget it and it comes back soon.
      </p>

      <h2>How many new cards a day?</h2>
      <p>
        Start with 10 to 20. Every new card brings future reviews with it, so after a few weeks your daily reviews settle at
        several times your daily new cards. If reviews start to feel like a chore, add fewer new cards for a while rather than
        skipping days.
      </p>

      <h2>Writing cards that work</h2>
      <ul>
        <li><strong>One fact per card.</strong> “What does 食べる mean?” beats “List ten verbs.”</li>
        <li><strong>Ask a real question.</strong> The front should make you recall, not recognise.</li>
        <li><strong>Use cloze for facts in context.</strong> “The <code>{'{{c1::mitochondria}}'}</code> make ATP” keeps the sentence and hides the word.</li>
        <li><strong>Add an example.</strong> A sentence, a picture or a mnemonic gives the memory something to hold on to.</li>
        <li><strong>Rewrite cards you keep missing.</strong> A card you fail every week is usually a badly written card.</li>
      </ul>

      <h2>A routine that sticks</h2>
      <ol>
        <li>Do your due reviews first, every day, even if only for ten minutes.</li>
        <li>Then add your new cards.</li>
        <li>Use the keyboard: Space to flip, 1 to 4 to rate. It doubles your speed.</li>
        <li>Work in short blocks. Ankitti has a focus timer with a soft chime for breaks.</li>
      </ol>
      <p>
        Already have decks in Anki? You can <L to="open-apkg-file">open your .apkg files</L> in Ankitti and keep your progress.
      </p>
    </>
  ),
  faq: [
    {
      q: 'How long until spaced repetition works?',
      a: 'You will notice cards getting easier within a week. The real payoff shows after a month or two, when facts you learned early still come back without effort.',
    },
    {
      q: 'Is spaced repetition good for languages?',
      a: 'Yes. Vocabulary, kanji and grammar patterns are some of the most popular uses, from JLPT preparation to travel phrases.',
    },
    {
      q: 'What happens if I miss a day?',
      a: 'The cards wait for you. Do the oldest reviews first and spread a big backlog over a few days. In Ankitti you can also relearn any deck whenever you like.',
    },
  ],
};

export const GUIDE_CONTENT: Record<string, GuideContent> = {
  'anki-alternative': ankiAlternative,
  'open-apkg-file': openApkg,
  'sm2-algorithm': sm2,
  'spaced-repetition': spaced,
};
