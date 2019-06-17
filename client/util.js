var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

function replaceTag(tag) {
    return tagsToReplace[tag] || tag;
}


export function escape(html) {
  return html.replace(/[&<>]/g, replaceTag);
}