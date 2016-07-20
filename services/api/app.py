from __future__ import print_function # In python 2.7
import sys

from flask import Flask, request, session, jsonify, abort
import json
import os
import requests
from werkzeug.utils import secure_filename
import httplib, urllib, base64

from models import WatsonStoryToText
from models.syntax_net_to_graph import Graph

from utils import crossdomain

ALLOWED_EXTENSIONS = set(['wav'])

app = Flask(__name__)
app.config.from_pyfile('main.cfg')

story_to_text = WatsonStoryToText(
    username=app.config['WATSON_USERNAME'],
    password=app.config['WATSON_PASSWORD'])

def _syntax_net(objs):
    all_reqs = []
    for obj in objs:
        print('HERE: ', obj, file=sys.stderr)
        all_reqs.append(
            requests.post(
                'http://130.211.127.78:3033/syntaxnet',
                headers={'content-type': 'application/json'},
                data=json.dumps(obj),
            )
        )

    return [req.json() for req in all_reqs]

@app.route('/')
@crossdomain(origin='*')
def index():
    return jsonify('Winter is Coming.')

# can be POST /nlp - which is audio input
# or GET /nlp?text=i+have+a+dog - which is text input
@app.route('/nlp', methods=['GET', 'POST'])
@crossdomain(origin='*')
def nlp():
    text_in = request.args.get('text')

    # if text param is present and is true
    if text_in is not None:
        text_out = text_in
    else:
        if 'data' not in request.files:
            abort(400)

        audio_in = request.files['data']
        if audio_in:
            audio_filename = secure_filename(audio_in.filename)
            audio_in_path = os.path.join(app.config['UPLOAD_FOLDER'],
                                         audio_filename)
            audio_in.save(audio_in_path)
            text_out = story_to_text.recognize(audio_in_path)

    # return 200 and audio text
    return jsonify(text=text_out)

@app.route('/graph', methods=['GET'])
@crossdomain(origin='*')
def graph():
    return jsonify(nodes=['test_node'])

@app.route('/syntaxnet', methods=['POST', 'OPTIONS'])
@crossdomain(origin='*')
def syntaxnet():
    obj = json.loads(request.data)
    all_nodes = _syntax_net([obj])
    assert len(all_nodes) == 1, '1 ONE'
    summary_raw = Graph(all_nodes[0]).find_strings()
    summary = list(summary_raw) if (summary_raw and len(summary_raw)) else []
    return jsonify(summary=(summary), nodes=all_nodes[0])

# template = "https://www.google.com/search?hl=en&authuser=0&site=imghp&tbm=isch&source=hp&q={0}"
# template = "https://www.google.com/complete/search?client=img&hl=en&gs_rn=64&gs_ri=img&ds=i&pq={0}&cp=3&gs_id=719&q={0}&xhr=t"
@app.route('/image', methods=['GET'])
@crossdomain(origin='*')
def image():
  words = request.args['q']
  # Returns the image URL, not the image itself.
  return bing_image_search(words)

def bing_image_search(query):
  headers = {
      # Request headers
      'Ocp-Apim-Subscription-Key': '2bc8ba92b0544d87aa0d36a0c066e62f',
  }

  params = urllib.urlencode({
      # Request parameters
      'q': query + ' simple cartoon',
      'count': '1',
      'offset': '0',
      'mkt': 'en-us',
      'safeSearch': 'Moderate',
  })

  try:
    conn = httplib.HTTPSConnection('api.cognitive.microsoft.com')
    conn.request("GET", "/bing/v5.0/images/search?%s" % params, "{body}", headers)
    response = conn.getresponse()
    data = response.read()
    conn.close()
    return json.loads(data)["value"][0]["contentUrl"]
  except:
    conn.close()
    raise

def allowed_file(filename):
    return '.' in filename and \
            filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS
