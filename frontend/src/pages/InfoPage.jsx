import { Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, BookOpen, Briefcase, Cookie, FileText, LifeBuoy,
  Lock, Newspaper, Scale, ScrollText, Server, ShieldCheck, Sprout, Users,
} from 'lucide-react';

/**
 * Content for the informational pages linked from the footer, so every link in
 * the product resolves to a real page instead of a dead route.
 */
const PAGES = {
  about: {
    Icon: Users,
    eyebrow: 'Company',
    title: 'About BorrowBox',
    intro:
      'BorrowBox is a community lending platform built around a simple observation: most households own things they use a handful of times a year, while their neighbours buy the same things and store them just as rarely.',
    sections: [
      {
        heading: 'Our mission',
        body: [
          'We make borrowing from the people around you as easy as buying online. That means clear listings, honest reputation, simple agreements and pickup within walking distance.',
          'Every borrow replaces a purchase, and every shared item stays in use for longer instead of gathering dust.',
        ],
      },
      {
        heading: 'Where we operate',
        body: [
          'BorrowBox runs in 42 neighbourhoods across the Bay Area with 2,400 active members and more than 3,800 completed borrows.',
        ],
      },
      {
        heading: 'How we make money',
        body: [
          'Personal lending is free. We charge an optional platform fee only when a lender sets a daily rental price, and business workspaces pay a monthly subscription.',
        ],
      },
    ],
  },
  careers: {
    Icon: Briefcase,
    eyebrow: 'Company',
    title: 'Careers at BorrowBox',
    intro: 'We are a small, product-obsessed team building the infrastructure for local sharing.',
    sections: [
      {
        heading: 'Open roles',
        body: [
          'Senior Product Designer (San Francisco or remote)',
          'Full-stack Engineer, Platform (remote, US timezones)',
          'Trust & Safety Specialist (San Francisco)',
          'Community Manager, Bay Area (hybrid)',
        ],
      },
      {
        heading: 'How we work',
        body: [
          'Small teams, written decisions, no meetings before 11am. We ship weekly and talk to members every single week.',
        ],
      },
    ],
  },
  press: {
    Icon: Newspaper,
    eyebrow: 'Company',
    title: 'Press and media',
    intro: 'Logos, screenshots and boilerplate for journalists and partners.',
    sections: [
      {
        heading: 'Brand assets',
        body: [
          'Our logo, product screenshots and colour system are available on request. Write to press@borrowbox.com and we will send a link within one business day.',
        ],
      },
      {
        heading: 'Boilerplate',
        body: [
          'BorrowBox is a community lending platform that lets neighbours borrow tools, gear and equipment from each other instead of buying new. Founded in San Francisco, the company operates across 42 neighbourhoods.',
        ],
      },
    ],
  },
  help: {
    Icon: LifeBuoy,
    eyebrow: 'Support',
    title: 'Help centre',
    intro: 'Answers to the questions we hear most often from borrowers and lenders.',
    sections: [
      {
        heading: 'Borrowing',
        body: [
          'Send a request with dates and a short note. The owner gets a notification immediately and can approve or decline from their requests page.',
          'Once approved, coordinate pickup in the in-app messages and confirm the handover. The item is then marked as on loan.',
        ],
      },
      {
        heading: 'Lending',
        body: [
          'List an item with at least one clear photo, an honest condition note and a pickup neighbourhood. You keep full control and can pause a listing at any time.',
        ],
      },
      {
        heading: 'Account and security',
        body: [
          'Passwords are hashed, sessions are signed and every action on an item or request is authorised against your account.',
          'Enable verification to earn the verified badge and unlock higher-value items.',
        ],
      },
      {
        heading: 'Still stuck?',
        body: ['Email support@borrowbox.com and we reply within one business day.'],
      },
    ],
  },
  safety: {
    Icon: ShieldCheck,
    eyebrow: 'Trust',
    title: 'Trust and safety',
    intro: 'How BorrowBox keeps lending between strangers as safe as lending between friends.',
    sections: [
      {
        heading: 'Verification',
        body: [
          'Members confirm their email, phone number and a photo before their first lend. Verified members receive a badge on every listing.',
        ],
      },
      {
        heading: 'Protection',
        body: [
          'Approved borrows include up to $500 of item protection. Report damage from the request page within 48 hours of return and our trust team mediates.',
        ],
      },
      {
        heading: 'Privacy',
        body: [
          'Listings show a neighbourhood and approximate distance only. Exact pickup details are shared inside an approved borrow conversation.',
        ],
      },
      {
        heading: 'Reporting',
        body: [
          'Every listing and profile has a report action. Reports are reviewed by a human within one business day, and repeat offenders are removed.',
        ],
      },
    ],
  },
  guidelines: {
    Icon: ScrollText,
    eyebrow: 'Trust',
    title: 'Community guidelines',
    intro: 'The short version: be accurate, be kind, return things how you received them.',
    sections: [
      {
        heading: 'Describe items honestly',
        body: ['Photograph the actual item you are lending and mention wear, missing parts or quirks upfront.'],
      },
      {
        heading: 'Respect the dates',
        body: ['If plans change, message the other member as early as possible and update the request.'],
      },
      {
        heading: 'Keep it legal',
        body: ['No weapons, controlled substances, medical devices or anything that breaks local law.'],
      },
      {
        heading: 'No off-platform payments',
        body: ['Keep fees inside BorrowBox so both sides stay protected and covered.'],
      },
    ],
  },
  status: {
    Icon: Server,
    eyebrow: 'Support',
    title: 'System status',
    intro: 'Live status of the BorrowBox platform and its services.',
    sections: [
      {
        heading: 'Current status',
        body: ['All systems operational. Web application, API, search and notifications are responding normally.'],
      },
      {
        heading: 'Incident history',
        body: [
          'No incidents in the last 90 days.',
          'Scheduled maintenance happens on the first Tuesday of each month between 02:00 and 03:00 PT.',
        ],
      },
      {
        heading: 'API health',
        body: ['Uptime over the last 30 days: 99.98%. Status is available programmatically at /api/health.'],
      },
    ],
  },
  terms: {
    Icon: FileText,
    eyebrow: 'Legal',
    title: 'Terms of service',
    intro: 'These terms govern your use of BorrowBox. By creating an account you agree to them.',
    sections: [
      {
        heading: 'Your account',
        body: [
          'You must be 18 or older and provide accurate information. You are responsible for activity that happens under your account.',
        ],
      },
      {
        heading: 'Lending and borrowing',
        body: [
          'BorrowBox facilitates agreements between members. Owners remain responsible for describing their items accurately and borrowers for returning them in the agreed condition.',
        ],
      },
      {
        heading: 'Fees',
        body: ['Listing is free. Optional daily fees set by owners are shown before a request is confirmed.'],
      },
      {
        heading: 'Suspension',
        body: ['We may suspend accounts that break community guidelines, commit fraud or repeatedly cancel agreed borrows.'],
      },
    ],
  },
  privacy: {
    Icon: Lock,
    eyebrow: 'Legal',
    title: 'Privacy policy',
    intro: 'We collect the minimum we need to run a trustworthy lending marketplace.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'Account details (name, email, neighbourhood), listings you publish, requests you send and messages exchanged inside BorrowBox.',
        ],
      },
      {
        heading: 'What we never do',
        body: ['We do not sell personal data, and we never share your exact address with the public catalogue.'],
      },
      {
        heading: 'Your controls',
        body: [
          'You can edit or delete your profile data, export your listings and request full account deletion from your profile page.',
        ],
      },
      {
        heading: 'Security',
        body: ['Passwords are stored with bcrypt hashing and sessions use signed, expiring JSON Web Tokens.'],
      },
    ],
  },
  cookies: {
    Icon: Cookie,
    eyebrow: 'Legal',
    title: 'Cookie preferences',
    intro: 'BorrowBox uses a small number of cookies and local storage keys.',
    sections: [
      {
        heading: 'Essential',
        body: ['Session token and preferences. These cannot be disabled because the product will not work without them.'],
      },
      {
        heading: 'Analytics',
        body: ['Aggregated, anonymised usage data helps us see which features are used. No personal data leaves your device.'],
      },
      {
        heading: 'Managing preferences',
        body: ['Clear your browser storage to reset preferences, or contact privacy@borrowbox.com for a full export.'],
      },
    ],
  },
  'lending-agreement': {
    Icon: Scale,
    eyebrow: 'Legal',
    title: 'Standard lending agreement',
    intro: 'The terms that apply to each approved borrow on BorrowBox.',
    sections: [
      {
        heading: 'Borrower commitments',
        body: [
          'Use the item for its intended purpose, return it on the agreed date in the condition received, and report any damage immediately.',
        ],
      },
      {
        heading: 'Owner commitments',
        body: [
          'Provide a safe, working item that matches the listing and be reachable during the borrow window.',
        ],
      },
      {
        heading: 'Protection',
        body: [
          'Accidental damage reported within 48 hours is covered up to $500 per borrow, subject to trust-team review.',
        ],
      },
      {
        heading: 'Late returns',
        body: ['Unreturned items are escalated after 72 hours, and the borrower account is paused during review.'],
      },
    ],
  },
  licenses: {
    Icon: BookOpen,
    eyebrow: 'Legal',
    title: 'Licenses and attribution',
    intro: 'BorrowBox is built with open-source software and we are grateful to its maintainers.',
    sections: [
      {
        heading: 'Platform',
        body: [
          'React and React Router (MIT), Tailwind CSS (MIT), Vite (MIT), Express (MIT), Joi (BSD-3-Clause), bcrypt.js (MIT), jsonwebtoken (MIT).',
        ],
      },
      {
        heading: 'Interface',
        body: ['Icons by Lucide (ISC). Typography: Space Grotesk and Plus Jakarta Sans (SIL Open Font License).'],
      },
      {
        heading: 'Imagery',
        body: ['Listing photography in the demo dataset is provided by Unsplash under the Unsplash License.'],
      },
    ],
  },
};

const HIGHLIGHTS = [
  { Icon: Sprout, text: 'Carbon-aware by design' },
  { Icon: BadgeCheck, text: 'Verified members only' },
  { Icon: Lock, text: 'Private by default' },
];

export default function InfoPage() {
  const { pathname } = useLocation();
  const slug = pathname.replace('/', '');
  const page = PAGES[slug];

  if (!page) {
    return (
      <div className="shell py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">The page you were looking for does not exist.</p>
        <Link to="/" className="btn btn-primary btn-md mt-6">Back home</Link>
      </div>
    );
  }

  const { Icon, eyebrow, title, intro, sections } = page;

  return (
    <div className="min-h-screen">
      <div className="border-b border-border surface-muted">
        <div className="shell py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-500 transition-colors hover:text-brand-700 dark:text-zinc-400 dark:hover:text-brand-300">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>

          <div className="mt-6 flex items-start gap-4">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-brand-600 dark:text-brand-300">
              <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="mt-2 font-display text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[38px]">{title}</h1>
              <p className="mt-3 max-w-[680px] text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">{intro}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="shell grid gap-10 py-12 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.heading} className="card p-6">
              <h2 className="font-display text-[17px] font-semibold">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-[14.5px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[92px] lg:self-start">
          <div className="card p-5">
            <h2 className="font-display text-[15px] font-semibold">Why members trust BorrowBox</h2>
            <ul className="mt-4 space-y-3">
              {HIGHLIGHTS.map(({ Icon: HighlightIcon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-[13.5px] text-zinc-600 dark:text-zinc-400">
                  <HighlightIcon className="h-4 w-4 flex-shrink-0 text-brand-600 dark:text-brand-300" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-[15px] font-semibold">Need a hand?</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
              Our support team answers every message within one business day.
            </p>
            <a href="mailto:support@borrowbox.com" className="btn btn-secondary btn-sm mt-4 w-full">
              support@borrowbox.com
            </a>
            <Link to="/browse" className="btn btn-primary btn-sm mt-2 w-full">Browse items</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

export const INFO_PAGE_SLUGS = Object.keys(PAGES);
