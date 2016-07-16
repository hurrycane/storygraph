# all the imports
import os
from flask import Flask, request, session, jsonify, abort
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = '/'
ALLOWED_EXTENSIONS = set(['wav'])

# create our little application :)
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config.from_object(__name__)

@app.route('/')
def index():
  return 'Winter is Coming.'

# can be POST /nlp - which is audio input
# or GET /nlp?text=i+have+a+dog - which is text input
@app.route('/nlp', methods=['GET', 'POST'])
def nlp():
    textIn = request.args.get('text','')
    if textIn:
        #skip s2t
        textOut = textIn
    else:
        if 'file' not in request.files:
            abort(400)
        audioIn = request.files['audio_wav_file']
        if audioIn and allowed_file(audioIn.filename):
            audioFilename = secure_filename(audioIn.filename)
            audioIn.save(os.path.join(app.config['UPLOAD_FOLDER'], audioFilename))
        # TODO: chunk audio if needed, apply s2t on audio
        # textOut = s2t(audioIn)

    # TODO:
    # Fire off job to build entity graph - think about concurency?
    # do syncronously for now

    textOut = "I have a dog.  Its name is Lisa." # sample text

    # return 200 and audio text
    return jsonify(text=textOut)

@app.route('/graph', methods=['GET'])
def graph():
    return jsonify(nodes=set(['test_node']))

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS
