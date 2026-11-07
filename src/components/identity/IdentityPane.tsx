import React, { useEffect, useState } from 'react';
import { profileBio, systemInfo } from '../../data/profileData';

const BOOT_KEY = 'portfolio-booted';
const FULL_NAME = profileBio.fullName;
// The tagline lists several roles; the identity window shows only the first.
const TITLE = (() => {
  const first = profileBio.tagline.split('•')[0].trim();
  return first.charAt(0) + first.slice(1).toLowerCase();
})();

function useTypedName(): string {
  const [shown, setShown] = useState(() => {
    try {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return reduced || sessionStorage.getItem(BOOT_KEY) ? FULL_NAME.length : 0;
    } catch {
      return FULL_NAME.length;
    }
  });

  useEffect(() => {
    if (shown >= FULL_NAME.length) return;
    const step = Math.max(30, Math.floor(600 / FULL_NAME.length));
    const t = setInterval(() => {
      setShown((n) => {
        if (n + 1 >= FULL_NAME.length) {
          clearInterval(t);
          try {
            sessionStorage.setItem(BOOT_KEY, '1');
          } catch {
            // Storage blocked: the name simply types out again next visit.
          }
        }
        return n + 1;
      });
    }, step);
    return () => clearInterval(t);
    // Runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return FULL_NAME.slice(0, shown);
}

const linkClass = 'text-sky underline decoration-1 underline-offset-2 hover:decoration-2';

const IdentityPane: React.FC = () => {
  const typed = useTypedName();
  const [first, ...rest] = typed.split(' ');
  const hasCv = Boolean(profileBio.cvUrl);

  return (
    <aside
      aria-labelledby="identity-name"
      className="boot-in shrink-0 overflow-y-auto rounded-xl border border-rule bg-panel p-4 sm:p-6 md:w-[22.5rem]"
    >
      <h1
        id="identity-name"
        aria-label={FULL_NAME}
        className="font-display text-[44px] leading-none text-chalk md:text-[66px]"
      >
        <span aria-hidden="true">
          {first}
          <span className="md:block"> {rest.join(' ')}</span>
          {typed.length < FULL_NAME.length && <span className="caret-blink bg-accent">&nbsp;</span>}
        </span>
      </h1>

      <p className="mt-4 font-semibold text-chalk">{TITLE}</p>
      <p className="mt-2 max-w-[36ch] leading-[1.6] text-pencil">{profileBio.shortBio}</p>

      <p className="mt-4 flex items-center gap-2 text-mint">
        <span aria-hidden="true" className="inline-block size-2 rounded-full bg-mint" />
        {systemInfo.status}
      </p>
      <p className="mt-1 text-pencil">{systemInfo.location}</p>

      <div className="mt-6 flex gap-3 md:flex-col">
        {hasCv && (
          <a
            href={profileBio.cvUrl}
            target="_blank"
            rel="noopener"
            className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-accent px-4 font-semibold text-accent-ink transition-opacity duration-150 hover:opacity-90"
          >
            Download CV
          </a>
        )}
        <a
          href={`mailto:${profileBio.socials.email}`}
          className={`flex min-h-11 flex-1 items-center justify-center rounded-lg px-4 font-semibold transition-colors duration-150 ${
            hasCv ? 'border border-chalk text-chalk hover:bg-chalk/10' : 'bg-accent text-accent-ink hover:opacity-90'
          }`}
        >
          Email Oren
        </a>
      </div>

      <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
        <a href={profileBio.socials.github} target="_blank" rel="noopener noreferrer" className={linkClass}>
          GitHub
        </a>
        <a href={profileBio.socials.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
          LinkedIn
        </a>
        {profileBio.socials.leetcode && (
          <a href={profileBio.socials.leetcode} target="_blank" rel="noopener noreferrer" className={linkClass}>
            LeetCode
          </a>
        )}
      </p>
    </aside>
  );
};

export default IdentityPane;
