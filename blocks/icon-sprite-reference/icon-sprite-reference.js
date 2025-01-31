import { span, div } from '../../scripts/utils/dom-helpers.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { decorateSpriteIcons } from '../../scripts/utils/sprite-icon.js';

export default async function decorate(block) {
  block.replaceChildren();
  const config = readBlockConfig(block);
  const parser = new DOMParser();

  const url = config.sprite || `${window.hlx.codeBasePath}/icons/sprite.svg`;
  let sprite;
  try {
    sprite = await fetch(url)
      .then((response) => response.text())
      .then((html) => parser.parseFromString(html, 'image/svg+xml'));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Unable to find sprite file', e);
    return;
  }

  sprite.querySelectorAll('symbol').forEach((symbol) => {
    const iconName = symbol.id.startsWith('icon-') ? symbol.id : `icon-${symbol.id}`;
    block.append(div({ class: 'icon-wrapper' }, div(span({ class: `icon ${iconName}` })), span(`:${iconName.substring(5)}:`)));
  });
  await decorateSpriteIcons(block);
}
