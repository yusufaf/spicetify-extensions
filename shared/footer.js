/**
 * Settings footer shared by every extension: version, Docs, More extensions and a
 * report-an-issue link. Reads the file's EXT config; class names are built from
 * EXT.footerPrefix (`${footerPrefix}-footer`, `-footer-links`, `-version`, `-github-link`, `-github-icon`).
 */
const SHARED_HUB_URL = 'https://spicetify.yusufaf.dev/';

/** GitHub mark icon path (16x16 viewBox, Bootstrap Icons github, MIT) */
const SHARED_GITHUB_ICON_PATH = 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z';

/** @param {{ name: string, slug: string, version: string, footerPrefix: string }} ext */
function sharedFooterHtml(ext) {
  const p = ext.footerPrefix;
  const issueUrl = `https://github.com/yusufaf/spicetify-extensions/issues/new?template=${ext.slug}.yml`;
  return `
    <div class="${p}-footer">
      <span class="${p}-version">v${ext.version}</span>
      <div class="${p}-footer-links">
        <a href="${SHARED_HUB_URL}${ext.slug}/" target="_blank" rel="noopener noreferrer" title="${ext.name} documentation">Docs</a>
        <a href="${SHARED_HUB_URL}" target="_blank" rel="noopener noreferrer" title="More Spicetify extensions by yusufaf">More extensions</a>
        <a class="${p}-github-link" href="${issueUrl}" target="_blank" rel="noopener noreferrer" title="Report an issue on GitHub" aria-label="Report an issue on GitHub">
          <svg viewBox="0 0 16 16" class="${p}-github-icon" aria-hidden="true"><path d="${SHARED_GITHUB_ICON_PATH}"/></svg>
        </a>
      </div>
    </div>
  `;
}

/**
 * CSS for sharedFooterHtml, to append to the extension's own stylesheet.
 * `sticky` pins the footer to the bottom of Spicetify's PopupModal while the content scrolls.
 * @param {{ footerPrefix: string }} ext
 * @param {{ sticky?: boolean }} [options]
 */
function sharedFooterCss(ext, { sticky = false } = {}) {
  const p = ext.footerPrefix;
  const stickyRules = sticky
    ? `
      position: sticky;
      bottom: 0;
      padding: 10px 0 2px;
      /* Matches Spicetify's popup container, so the sticky footer blends in under any theme */
      background: var(--spice-player, var(--background-elevated-base, #121212));`
    : '';
  return `
    .${p}-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);${stickyRules}
    }
    .${p}-version {
      color: var(--spice-subtext, #b3b3b3);
      font-size: 0.75rem;
    }
    .${p}-footer-links {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .${p}-footer a[href] {
      display: inline-flex;
      align-items: center;
      color: var(--spice-subtext, #b3b3b3);
      font-size: 0.75rem;
      text-decoration: none;
    }
    .${p}-footer a[href]:hover {
      color: var(--spice-text, #fff);
      text-decoration: underline;
    }
    .${p}-footer a[href]:focus-visible {
      outline: 2px solid var(--spice-text, #fff);
      outline-offset: 2px;
      border-radius: 2px;
    }
    .${p}-github-icon {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
  `;
}
