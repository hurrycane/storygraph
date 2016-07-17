function removeNodeByLabel(label) {
  return `
    MATCH (ns:${label})
    DELETE ns;
  `;
}

function truncateByType(label) {
  return `
    MATCH (ns:${label})
    WHERE NOT m-[:]->ns
    DELETE ns
  `;
}

function compactByType(label) {
  return `
    MATCH (ns:${label}), (children), (parent)
    WHERE children-[rc:?]->ns AND parent<-[rp:?]-ns
    CREATE 
  `;
}

module.exports = {
  removeNodeByRel,
  truncateByType,
};
