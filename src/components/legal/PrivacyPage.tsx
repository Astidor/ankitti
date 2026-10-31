import React from 'react';
import { Shell } from '../guides/GuidePage';
import { PRIVACY } from '../../seo/site';

// Prerendered to /privacy/ and linked from the Play Store listing. Keep it in step with what
// src/worker.ts actually stores, and bump PRIVACY.updated in seo/site.ts when it changes.

const CONTACT = 'contact@ankitti.com';

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const PrivacyPage: React.FC = () => (
  <Shell
    crumbs={[{ href: '/', label: 'Ankitti' }, { label: 'Privacy' }]}
    h1="Privacy policy"
    lead="What Ankitti keeps about you, where it goes, and how to delete it. The short version: your cards are yours, we don’t sell or share them, and there are no ads or trackers."
    meta={`Updated ${formatDate(PRIVACY.updated)}`}
    mood="sleep"
  >
    <main className="lp-wrap gp-main gp-main-single">
      <article className="gp-prose">
        <p>
          This policy covers the Ankitti website at ankitti.com and the Ankitti app for Android, which opens
          the same site. “We” means the people who run Ankitti. If you have a question, write
          to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>

        <h2>Studying without an account</h2>
        <p>
          You can use Ankitti as a guest. Your decks, cards, review history and settings are then saved only in your
          browser’s storage on that device. They aren’t sent to us. Decks you import from Anki (.apkg files) are opened on
          your device too. Clearing your browser data, or choosing <em>Erase everything</em> in Account and settings,
          deletes them.
        </p>

        <h2>If you create an account</h2>
        <p>An account keeps your cards in sync across devices. To do that we store:</p>
        <ul>
          <li><strong>Sign-in details:</strong> your email address and a salted, hashed copy of your password. We never store the password itself.</li>
          <li><strong>Profile:</strong> your display name, what you’re studying for, an exam date if you set one, your daily goal, your streak and whether sounds are on.</li>
          <li><strong>Your study material:</strong> decks, cards (including any images you paste onto them), tags, drafts and deck settings.</li>
          <li><strong>Review history:</strong> for each review, which card it was, the button you pressed, how long you took and the next interval. This drives the scheduling and your stats.</li>
          <li><strong>Sessions:</strong> a random sign-in token that lasts 30 days, or until you sign out.</li>
        </ul>
        <p>
          We use this only to run Ankitti for you: signing you in, syncing your cards and scheduling reviews. We don’t
          sell it, use it for advertising or share it with anyone except the service providers listed below.
        </p>

        <h2>AI deck generation</h2>
        <p>
          When you use <em>Make cards with AI</em>, the topic, any notes you paste in, the card style and the number of
          cards are sent from our server to <a href="https://www.deepseek.com/" rel="noreferrer">DeepSeek</a>, the AI
          provider that writes the cards. DeepSeek handles that text under
          its <a href="https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html" rel="noreferrer">own privacy policy</a>,
          and may process it on servers in China. We don’t send your name, email or other cards with it, and we don’t keep
          the request after the cards come back. The cards you choose to add are then stored like any others.
        </p>
        <p>
          Please don’t paste anything you wouldn’t want a third party to read, such as patient details or other people’s
          personal data. AI generation is optional, and the rest of Ankitti works without it.
        </p>
        <p>
          If you add your own DeepSeek API key, it’s kept in your browser on that device and sent along with each
          generation request. We don’t save it on our servers.
        </p>

        <h2>Service providers</h2>
        <ul>
          <li>
            <strong>Cloudflare</strong> hosts the site and the database where account data lives. Like any web host, it
            handles your IP address and basic request details to deliver pages and block abuse.
          </li>
          <li><strong>DeepSeek</strong> writes AI-generated decks, as described above, and only when you ask it to.</li>
          <li><strong>Google Fonts</strong> serves the site’s typefaces, so your browser fetches them from Google, which sees your IP address.</li>
        </ul>
        <p>There are no analytics, advertising or tracking scripts on Ankitti.</p>

        <h2>Storage on your device</h2>
        <p>
          Ankitti saves your sign-in token, settings and an offline copy of your cards in your browser’s local storage. A
          service worker caches the app so it opens offline. None of this is used for tracking, and we don’t use cookies.
        </p>

        <h2>Your choices and rights</h2>
        <ul>
          <li><strong>See and download your data:</strong> <em>Account and settings → Download a backup</em> saves every deck, card and review as a .json file.</li>
          <li><strong>Correct it:</strong> edit your profile in Account and settings, and your cards in the app.</li>
          <li>
            <strong>Delete your account:</strong> <em>Account and settings → Delete account</em>, then confirm with your
            password. Your account, decks, cards, reviews, drafts and sessions are erased from our database straight away.
            Copies can stay in Cloudflare’s automatic database backups for up to 30 days before they expire.
          </li>
          <li>
            <strong>Can’t sign in?</strong> Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> from your account’s
            address and we’ll delete the account for you within 30 days.
          </li>
        </ul>
        <p>
          Depending on where you live (for example under the GDPR in the EU and UK, or under CCPA in California), you may
          also have the right to object to or restrict how we use your data, or to complain to your data protection
          authority. Write to us and we’ll help. We use account data because you need it to use the service you signed up
          for.
        </p>

        <h2>How long we keep it</h2>
        <p>
          We keep account data while you have an account. Sign-in sessions expire after 30 days. If you delete your
          account, everything goes as described above.
        </p>

        <h2>Security</h2>
        <p>
          Everything travels over HTTPS. Passwords are hashed with PBKDF2 and a unique salt, and every request for your
          data is checked against your session. No system is perfect, though, so please use a password you don’t use
          anywhere else.
        </p>

        <h2>Children</h2>
        <p>
          Ankitti is meant for learners aged 13 and over. We don’t knowingly create accounts for younger children. If you
          think a child under 13 has made an account, email us and we’ll delete it.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If what we collect or how we use it changes, we’ll update this page and the date at the top. If a change is
          significant, we’ll also say so in the app.
        </p>

        <h2>Contact</h2>
        <p>
          Questions, requests or worries: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
      </article>
    </main>
  </Shell>
);
