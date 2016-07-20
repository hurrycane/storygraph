/*License (MIT)

Copyright Â© 2013 Matt Diamond

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of
the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

(function(window) {

  var WORKER_PATH = 'js/recorderjs/recorderWorker.js';

  var Recorder = function(source, cfg) {
    var config = cfg || {};
    var bufferLen = config.bufferLen || 4096;
    this.context = source.context;
    if (!this.context.createScriptProcessor) {
      this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
    } else {
      this.node = this.context.createScriptProcessor(bufferLen, 2, 2);
    }

    var worker = new Worker(config.workerPath || WORKER_PATH);
    worker.postMessage({
      command: 'init',
      config: {
        sampleRate: this.context.sampleRate
      }
    });
    var recording = false,
      currCallback;

    this.node.onaudioprocess = function(e) {
      if (!recording) return;
      worker.postMessage({
        command: 'record',
        buffer: [
          e.inputBuffer.getChannelData(0),
          e.inputBuffer.getChannelData(1)
        ]
      });
    }

    this.configure = function(cfg) {
      for (var prop in cfg) {
        if (cfg.hasOwnProperty(prop)) {
          config[prop] = cfg[prop];
        }
      }
    }

    this.record = function() {
      recording = true;
    }

    this.stop = function() {
      recording = false;
    }

    this.clear = function() {
      worker.postMessage({
        command: 'clear'
      });
    }

    this.getBuffers = function(cb) {
      currCallback = cb || config.callback;
      worker.postMessage({
        command: 'getBuffers'
      })
    }

    this.exportWAV = function(cb, type) {
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/wav';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportWAV',
        type: type
      });
    }

    this.exportMonoWAV = function(cb, type) {
      currCallback = cb || config.callback;
      type = type || config.type || 'audio/wav';
      if (!currCallback) throw new Error('Callback not set');
      worker.postMessage({
        command: 'exportMonoWAV',
        type: type
      });
    }

    worker.onmessage = function(e) {
      var blob = e.data;
      currCallback(blob);
    }

    source.connect(this.node);
    this.node.connect(this.context.destination); // if the script node is not connected to an output the "onaudioprocess" event is not triggered in chrome.
  };

  Recorder.setupDownload = function(blob, filename) {
    var url = (window.URL || window.webkitURL).createObjectURL(blob);

    var fd = new FormData();
    fd.append('fname', filename);
    fd.append('data', blob);

    var ajax = new XMLHttpRequest();
    ajax.open("POST", "https://api.storygraph.me/nlp", true);
    ajax.send(fd);
    ajax.onload = function() {
      if (this.status >= 200 && this.status < 300) {
        jQuery("#subset").remove();

        jQuery("#mainbody").append("<div class='sixteen wide column' id='left'></div>");
        jQuery("#mainbody").append("<div class='sixteen wide column' id='right'><h3>This is your story</h3></div>");
        jQuery("#left").append("<div class='ui middle aligned center aligned row' id='top'></div>");
        jQuery("#left").append("<div class='row' id='bottom'></div>");
        jQuery("#top").append("<div class='ui middle aligned center aligned grid' id='top-left'><h4></h4></div>");
        jQuery("#top-left").append("<div class='sixteen wide column' id='text-align'></div>");
        jQuery("#bottom").append("<div id='chart'></div>");
        // jQuery("#text-align").append("<div class='content' id='content'></div>");
        // jQuery("#content").append("<h1 class='content1' id='content1'></h1>");


        // var mainbody = document.querySelector("#mainbody");
        // mainbody.classList.remove("grid", "aligned", "center", "aligned", "middle");
        // mainbody.classList.add("center", "aligned", "middle", "aligned", "grid");

        var j = JSON.parse(this.response);

        for (var i in j.text.results) {
          console.log(j.text.results[i]);
          document.getElementById('right').innerHTML = document.getElementById('right').innerHTML + j.text.results[i].alternatives[0].transcript + '<br/><hr>';
          // jQuery('#left').text(j.text.results[i].alternatives[0].transcript);
          console.log(j.text.results[i].alternatives[0].transcript);

          var access = new XMLHttpRequest();

          access.open("POST", "https://api.storygraph.me/syntaxnet", true);
          access.setRequestHeader("content-type", "application/json");
          access.send(JSON.stringify({
            input: j.text.results[i].alternatives[0].transcript,
          }));

          access.onload = function() {
            if (this.status >= 200 && this.status < 300) {
              var res = JSON.parse(this.response);
              var nodes = res.nodes;
              var summary = res.summary;
              viz(nodes);
              console.log("response", summary);

              var description = summary.join(" ")

                  var bingAjax = new XMLHttpRequest();
              bingAjax.open("GET", "https://api.storygraph.me/image?q=" + description, true);
              bingAjax.send();
              bingAjax.onload = function() {
                  if (this.status >= 200 && this.status < 300) {
                      $('#right').append("<img class='row' style='max-width:300px; max-height:300px; vertical-align: middle;' id='image" + i + "' src='" + this.response + "'></img>");
                  }
              }
            } else {
              console.log(this.response);
            }
          }
        }
      } else {
        console.log(this.response);
      }
    }

  }

  window.Recorder = Recorder;

})(window);
