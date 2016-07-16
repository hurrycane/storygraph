function parse(input) {
  const lines = input.replace(/\s+/g, ' ').split('\n');
  const output = {};

  lines.forEach(line => {
    const [
      id, form, lemma, cpostag, postag,
      feats, head, deprel, phead, pdeprel
    ] = line.split(' ');

    output[id] = {
      id, form, lemma, cpostag, postag,
      feats, head, deprel, phead, pdeprel
    };
  });

  return output;
}

module.exports = { parse };
