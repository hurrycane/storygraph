const exec = require('child_process').exec;
const DOCKER_ID = 'ad29b22a4fc2';

function syntaxnetCmd(input) {
  return `echo '${input}' | bazel-bin/syntaxnet/parser_eval \
    --input stdin \
    --output stdout-conll \
    --model syntaxnet/models/parsey_mcparseface/tagger-params \
    --task_context syntaxnet/models/parsey_mcparseface/context.pbtxt \
    --hidden_layer_sizes 64 \
    --arg_prefix brain_tagger \
    --graph_builder structured \
    --slim_model \
    --batch_size 1024 | bazel-bin/syntaxnet/parser_eval \
    --input stdin-conll \
    --output stdout-conll \
    --hidden_layer_sizes 512,512 \
    --arg_prefix brain_parser \
    --graph_builder structured \
    --task_context syntaxnet/models/parsey_mcparseface/context.pbtxt \
    --model_path syntaxnet/models/parsey_mcparseface/parser-params \
    --slim_model --batch_size 1024
  `;
}

function dockerRun(input) {
  return `docker run ${DOCKER_ID} -- ${input}`;
}

function syntaxnetOut(input) {
  const cmd = syntaxnetCmd(input);
  return new Promise((resolve, reject) => {
    child = exec(cmd, (error, stdout, stderr) => {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  });
}
