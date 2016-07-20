/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var audioInput = null,
  realAudioInput = null,
  inputPoint = null,
  audioRecorder = null;
var rafID = null;
var analyserContext = null;

var recIndex = 0;

/* TODO:

- offer mono option
- "Monitor input" switch
*/

function saveAudio() {
  audioRecorder.exportWAV(doneEncoding);
  // could get mono instead by saying
  // audioRecorder.exportMonoWAV( doneEncoding );
}

function gotBuffers(buffers) {
  // the ONLY time gotBuffers is called is right after a new recording is completed -
  // so here's where we should set up the download.
  audioRecorder.exportWAV(doneEncoding);
}

function doneEncoding(blob) {
  // Recorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
  Recorder.setupDownload(blob, "audio_wav_file" + ".wav");
}

function toggleRecording(e) {
  if (e.classList.contains("recording")) {
    // stop recording
    //icon blue inverted
    audioRecorder.stop();
    e.classList.remove("recording");
    audioRecorder.getBuffers(gotBuffers);
    e.classList.remove("button");
    e.classList.remove("inverted");
    e.classList.remove("red");
    e.classList.remove("icon");
    e.classList.add("loader");
    e.classList.add("active");
    e.classList.add("inline");
    e.classList.add("ui");
    e.classList.add("segment");
    e.classList.add("ui");
    e.classList.add("active");

    jQuery(function($) {
      $("#button1").css({
        "border": "none",
        "outline": "none",
        "box-shadow": "none"


      });
    });

    // jQuery('#countdown').html('');
    jQuery("#countdown").remove();

    var recordButtonIcon = document.querySelector("#recordButtonIcon");
    recordButtonIcon.classList.remove("icon", "talk");


    // var timer = document.querySelector("#countdown");
    // timer.classList.remove(tex);


    // e.classList.add("active dimmer ui loader");

    // TODO: loading icon
  } else {
    initAudio();

    setTimeout(function() {
      // start recording
      if (!audioRecorder)
        return;
      e.classList.add("recording");
      audioRecorder.clear();
      audioRecorder.record();

      e.classList.remove("blue");
      e.classList.add("red");
      e.classList.remove("inverted");

      var recordButtonIcon = document.querySelector("#recordButtonIcon");
      recordButtonIcon.classList.add("outline");

      var deadline = new Date(Date.parse(new Date()) + 30 * 1000);
      initializeClock("countdown", deadline)
    }, 300);
  }
}

function convertToMono(input) {
  var splitter = audioContext.createChannelSplitter(2);
  var merger = audioContext.createChannelMerger(2);

  input.connect(splitter);
  splitter.connect(merger, 0, 0);
  splitter.connect(merger, 0, 1);
  return merger;
}

function cancelAnalyserUpdates() {
  window.cancelAnimationFrame(rafID);
  rafID = null;
}



function toggleMono() {
  if (audioInput != realAudioInput) {
    audioInput.disconnect();
    realAudioInput.disconnect();
    audioInput = realAudioInput;
  } else {
    realAudioInput.disconnect();
    audioInput = convertToMono(realAudioInput);
  }

  audioInput.connect(inputPoint);
}

function gotStream(stream) {
  inputPoint = audioContext.createGain();

  // Create an AudioNode from the stream.
  realAudioInput = audioContext.createMediaStreamSource(stream);
  audioInput = realAudioInput;
  audioInput.connect(inputPoint);

  //    audioInput = convertToMono( input );

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 2048;
  inputPoint.connect(analyserNode);

  audioRecorder = new Recorder(inputPoint);

  zeroGain = audioContext.createGain();
  zeroGain.gain.value = 0.0;
  inputPoint.connect(zeroGain);
  zeroGain.connect(audioContext.destination);
}

function initAudio() {
  if (!navigator.getUserMedia)
    navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  // if (!navigator.cancelAnimationFrame)
  //     navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
  // if (!navigator.requestAnimationFrame)
  //     navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

  navigator.getUserMedia({
    "audio": {
      "mandatory": {
        "googEchoCancellation": "false",
        "googAutoGainControl": "false",
        "googNoiseSuppression": "false",
        "googHighpassFilter": "false"
      },
      "optional": []
    },
  }, gotStream, function(e) {
    alert('Error getting audio');
    console.log(e);
  });
}

// COUNTDOWN

function getTimeRemaining(endtime) {
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

function initializeClock(id, endtime) {
  var clock = document.getElementById(id);
  var timeinterval = setInterval(function() {
    var t = getTimeRemaining(endtime);
    clock.innerHTML = t.seconds + 's';
    if (t.total <= 0) {
      clearInterval(timeinterval);
    }
  }, 200);
}
