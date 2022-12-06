export function splitText(text, cls = '') {
  const highlightMatches = text.match(/(.+?)_(.+?)_(.+)/);
  if (highlightMatches) {
    return splitText(highlightMatches[1]) +
      splitText(highlightMatches[2], 'highlight') +
      splitText(highlightMatches[3]);
  }

  const clsName = cls ? `char ${cls}` : 'char';
  const html = [];
  for (let i = 0; i < text.length; i++) {
    const letter = text[i] == ' ' ? '&nbsp;' : text[i];
    html.push(`<span class="${clsName}">${letter}</span>`);
  }

  return html.join('');
}
