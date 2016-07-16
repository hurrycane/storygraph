import os
from flask import Flask, request, session, jsonify, abort
from werkzeug.utils import secure_filename

from models import WatsonStoryToText

ALLOWED_EXTENSIONS = set(['wav'])

app = Flask(__name__)
app.config.from_pyfile('main.cfg')

story_to_text = WatsonStoryToText(
    username=app.config['WATSON_USERNAME'],
    password=app.config['WATSON_PASSWORD'])

@app.route('/')
def index():
    return jsonify('Winter is Coming.')

# can be POST /nlp - which is audio input
# or GET /nlp?text=i+have+a+dog - which is text input
@app.route('/nlp', methods=['GET', 'POST'])
def nlp():
    text_in = request.args.get('text')

    # if text param is present and is true
    if text_in is not None:
        text_out = text_in
    else:
        if 'audio_wav_file' not in request.files:
            raise "a"
            abort(400)

        audio_in = request.files['audio_wav_file']
        if audio_in and allowed_file(audio_in.filename):
            audio_filename = secure_filename(audio_in.filename)
            audio_in_path = os.path.join(app.config['UPLOAD_FOLDER'],
                                         audio_filename)
            audio_in.save(audio_in_path)
            text_out = story_to_text.recognize(audio_in_path)

    # return 200 and audio text
    return jsonify(text=text_out)

@app.route('/graph', methods=['GET'])
def graph():
    return jsonify(nodes=['test_node'])

def allowed_file(filename):
    return '.' in filename and \
            filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS
