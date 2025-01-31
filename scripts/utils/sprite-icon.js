import { domEl } from './dom-helpers.js';
import { decorateIcons as aemDecorateIcons } from '../aem.js';

let sprite;

export function decorateSpriteIcon(span, prefix = '', alt = '') {
  const iconName = Array.from(span.classList).find((c) => c.startsWith('icon-'));

  const target = sprite.querySelector(`#${iconName}`);
  if (target) {
    const svg = domEl(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        alt,
        viewBox: target.getAttribute('viewBox'),
      },
      domEl('use', { href: `#${iconName}` })
    );

    // I don't know why the DOM Parser is needed, but if you don't do this, the icons never show up.
    span.append(
      new DOMParser().parseFromString(svg.outerHTML, 'image/svg+xml').querySelector('svg')
    );
  } else {
    aemDecorateIcons(span.parentElement, prefix);
  }
}

export async function decorateSpriteIcons(el, prefix = '') {
  if (!sprite) {
    try {
      // cache the sprite for future calls.
      const html = await fetch(`${window.hlx.codeBasePath}/icons/sprite.svg`).then((response) =>
        response.text()
      );
      sprite = new DOMParser().parseFromString(html, 'image/svg+xml').querySelector('svg');
      document.body.append(sprite);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Unable to process sprite file', e);
      // fall back to normal processing
      aemDecorateIcons(el, prefix);
    }
  }
  el.querySelectorAll('span.icon').forEach((span) => {
    decorateSpriteIcon(span, prefix);
  });
}
