function removeNodeByLabel(label) {
  return `
    MATCH (ns:${label}), (n-[r?]-())
    DELETE r, ns;
  `;
}

function truncateByType(label) {
  return `
    MATCH (ns:${label}), (ns-[r?]-())
    WHERE NOT m-[:]->ns
    DELETE ns, r;
  `;
}

function compactByType(label) {
  throw new Exception('X_X');
  return `
    MATCH (ns:${label}), (children), (parent)
    WHERE children-[rc:?]->ns AND parent<-[rp:?]-ns
    CREATE
  `;
}

function whatDoesNounVerbQuery(subject, object, verb) {
  return `
    MATCH (n), (ms), (s)
    WHERE n.name = ${object} AND ms-[:IS]->n and s-[:${VERB}]->ms
    RETURN ms, s, n;
  `;
}

module.exports = {
  removeNodeByRel,
  truncateByType,
  whatDoesNounVerbQuery,
};
