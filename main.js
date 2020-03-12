(function() {
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
        args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
  function createWorker(workerUrl) {
    var worker = null;
    try {
      worker = new Worker(workerUrl);
    } catch (e) {
      try {
        var blob;
        try {
          blob = new Blob(["importScripts('" + workerUrl + "');"], {
            "type": 'application/javascript'
          });
        } catch (e1) {
          var blobBuilder = new(window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder)();
          blobBuilder.append("importScripts('" + workerUrl + "');");
          blob = blobBuilder.getBlob('application/javascript');
        }
        var url = window.URL || window.webkitURL;
        var blobUrl = url.createObjectURL(blob);
        worker = new Worker(blobUrl);
      } catch (e2) {
        //if it still fails, there is nothing much we can do
      }
    }
    return worker;
  }
  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineBadge.classList.remove('show');
    } else {
      offlineBadge.classList.add('show');
    }
  }
  var input = document.getElementById('input'),
    output = document.getElementById('output'),
    view = document.getElementById('view'),
    encode = document.getElementsByName('encode'),
    beautify = document.getElementById('beautify'),
    auto = document.getElementById('auto'),
    redecode = document.getElementById('redecode'),
    clear = document.getElementById('clear'),
    preview = document.getElementById('preview'),
    clipboard = new ClipboardJS('#copyjs', {
      target: function() {
        return view;
      }
    }),
    offlineBadge = document.getElementById('offline'),
    startEffect = function() {
      if (output.value === '') view.textContent = 'Please wait...';
      view.classList.add('waiting');
    },
    stopEffect = function() {
      view.classList.remove('waiting');
    },
    resetcopy = function(trigger) {
      if (!trigger.classList.contains('copied')) return;
      trigger.classList.remove('copied');
    },
    timereset = function(trigger) {
      setTimeout(function() {
        resetcopy(trigger);
      }, 800);
    },
    externalStyle = '*{margin:0;padding:0}html{line-height:1em;background:#1d1f21;color:#c5c8c6}pre{counter-reset:line-numbers;white-space:pre-wrap;word-wrap:break-word;word-break:break-all}code::before{counter-increment:line-numbers;content:counter(line-numbers);display:block;position:absolute;left:-4.5em;top:0;width:4em;text-align:right;color:#60686f;white-space:pre}code{display:block;position:relative;margin-left:4em;padding-left:.5em;min-height:1em;border-left:1px solid #32363b}pre{padding:.5em .5em .5em 5em;border-left:1px solid #1d1f21}pre.hljs{padding-left:.5em;border-left:0 none}code::after{content:".";visibility:hidden} .hljs-comment,.hljs-quote{color:#969896}.hljs-variable,.hljs-template-variable,.hljs-tag,.hljs-name,.hljs-selector-id,.hljs-selector-class,.hljs-regexp,.hljs-deletion{color:#c66}.hljs-number,.hljs-built_in,.hljs-builtin-name,.hljs-literal,.hljs-type,.hljs-params,.hljs-meta,.hljs-link{color:#de935f}.hljs-attribute{color:#f0c674}.hljs-string,.hljs-symbol,.hljs-bullet,.hljs-addition{color:#b5bd68}.hljs-title,.hljs-section{color:#81a2be}.hljs-keyword,.hljs-selector-tag{color:#b294bb}.hljs{display:block;overflow-x:auto;background:#1d1f21;color:#c5c8c6;padding:.5em}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:700}',
    externalUrl,
    externalPreview = function(source) {
      if (externalUrl) URL.revokeObjectURL(externalUrl);
      source = '<html><head><meta charset="utf-8"><link rel="shortcut icon" type="image/png" href="/de4js/favicon.png"><title>de4js | Preview</title><style>' + externalStyle + '</style></head><body><pre class="hljs">' + source + '</pre></body></html>';
      externalUrl = new Blob([source], {
        type: 'text/html'
      });
      externalUrl = URL.createObjectURL(externalUrl);
      preview.classList.add('show');
      preview.href = externalUrl;
    },
    workerFormat,
    workerDecode,
    format = debounce(function() {
      var source = output.value.trim();
      if (source === '') return;
      if (!workerFormat) {
        workerFormat = createWorker('https://vietbloggerdesign.github.io/de4js/format.js');
        workerFormat.addEventListener('message', function(e) {
          view.innerHTML = e.data;
          externalPreview(e.data);
          stopEffect();
        });
      }
      startEffect();
      workerFormat.postMessage({
        source: source,
        beautify: beautify.checked
      });
    }, 250),
    detect = function(source) {
      var type = '';
      if (/^[\s\n]*var\s_\d{4};[\s\n]*var\s_\d{4}\s?=/.test(source)) {
        type = '_numberencode';
      } else if (source.indexOf("/&#65344;ｍ&#180;&#65289;ﾉ ~&#9531;&#9473;&#9531;   //*&#180;&#8711;&#65344;*/ ['_'];") !== -1) { // eslint-disable-line quotes
        type = 'aaencode';
      } else if (source.indexOf('$={___:++$,$$$$:(![]+"")[$]') !== -1) {
        type = 'jjencode';
      } else if (source.replace(/[[\]()!+]/gm, '').trim() === '') {
        type = 'jsfuck';
      } else if (source.indexOf(' ') === -1 && (source.indexOf('%2') !== -1 || source.replace(/[^%]+/g, '').length > 3)) {
        type = 'urlencode';
      } else if (/^[\s\n]*var\s_0x\w+\s?=\s?\["/.test(source)) {
        type = 'arrayencode';
      } else if (source.indexOf('eval(') !== -1) {
        if (/\b(window|document|console)\.\b/i.test(source)) return type;
        type = 'evalencode';
      }
      document.querySelector('.magic-radio:checked').checked = false;
      document.querySelector('.magic-radio[value="' + type + '"]').checked = true;
      return type;
    },
    decode = debounce(function() {
      var source = input.value.trim(),
        packer = document.bvDecode.encode.value;
      if (source === '') return;
      if (auto.checked) packer = detect(source);
      if (packer === 'nicify') return;
      if (packer === '') {
        output.value = source;
        format();
        return;
      }
      if (!workerDecode) {
        workerDecode = createWorker('https://vietbloggerdesign.github.io/de4js/decode.js');
        workerDecode.addEventListener('message', function(e) {
          output.value = e.data;
          if (auto.checked && input.value !== output.value) {
            redecode.onclick();
          } else {
            format();
          }
        });
      }
      startEffect();
      output.value = '';
      workerDecode.postMessage({
        source: source,
        packer: packer
      });
    }, 250);
  input.oninput = debounce(function() {
    decode();
  });
  for (var i = 0; i < encode.length; i++) {
    encode[i].onchange = decode;
  }
  beautify.onchange = format;
  auto.onchange = function() {
    for (var i = 0; i < encode.length; i++) {
      if (encode[i].value === 'nicify') continue;
      encode[i].disabled = auto.checked;
    }
    decode();
  };
  clipboard.on('success', function (e) {
    e.trigger.classList.add('copied');
    e.clearSelection();
    timereset(e.trigger);
  });
  clipboard.on('error', function (e) {
    e.trigger.classList.add('selected');
    timereset(e.trigger);
  });
  redecode.onclick = function() {
    input.value = output.value;
    decode();
  };
  clear.onclick = function() {
    view.textContent = 'Please choose a right encoding type & wait for a vile after pasting code!';
    stopEffect();
    setTimeout(function() {
      auto.onchange();
    }, 0);
    if (workerDecode) {
      workerDecode.terminate();
      workerDecode = undefined;
    }
    if (workerFormat) {
      workerFormat.terminate();
      workerFormat = undefined;
    }
    preview.classList.remove('show');
  };
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
})();
