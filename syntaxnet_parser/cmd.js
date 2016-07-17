const path = require('path');
const exec = require('child_process').exec;

const ROOT = '/home/nitin/models/syntaxnet'

if (process.env.REALZ) {
  process.chdir(ROOT);
}

function syntaxnetCmd(input) {
  return `echo '${input}' | ${'bazel-bin/syntaxnet/parser_eval'} \
    --input stdin \
    --output stdout-conll \
    --model ${'syntaxnet/models/parsey_mcparseface/tagger-params'} \
    --task_context ${'syntaxnet/models/parsey_mcparseface/context.pbtxt'} \
    --hidden_layer_sizes 64 \
    --arg_prefix brain_tagger \
    --graph_builder structured \
    --slim_model \
    --batch_size 1024 | ${'bazel-bin/syntaxnet/parser_eval'} \
    --input stdin-conll \
    --output stdout-conll \
    --hidden_layer_sizes 512,512 \
    --arg_prefix brain_parser \
    --graph_builder structured \
    --task_context ${'syntaxnet/models/parsey_mcparseface/context.pbtxt'} \
    --model_path ${'syntaxnet/models/parsey_mcparseface/parser-params'} \
    --slim_model --batch_size 1024
  `;
}

function syntaxnetOut(input) {
  const cmd = syntaxnetCmd(input);
  return new Promise((resolve, reject) => {
    child = exec(cmd, (error, stdout, stderr) => {
      return resolve(stdout);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  });
}

module.exports = { run: syntaxnetOut };
