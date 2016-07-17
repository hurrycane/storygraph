function keep(l) {
  return l && l.cpostag !== '.';
}

function parse(input)  {
  const lines = input.replace(/[\t +]/g, ' ').split('\n');
  const output = [] ;

  lines.filter(keep).forEach(line => {
    const splits = line.split(' ');

    const id = splits[0];
    const form = splits[1];
    const lemma = splits[2];
    const cpostag = splits[3];
    const postag = splits[4];
    const feats = splits[5];
    const head = splits[6];
    const deprel = splits[7];
    const phead = splits[8];
    const pdeprel = splits[9];

    output.push({
      id, form, lemma, cpostag, postag,
      feats, head, deprel, phead, pdeprel,
      src: id,
      dst: head,
    });
  });

  return output;
}

module.exports = { parse };
