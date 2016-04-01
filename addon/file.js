import Ember from 'ember';
import FileReader from 'system/file-reader';
import HTTPRequest from 'system/http-request';

const { RSVP, get } = Ember;
const { reads } = Ember.computed;

function normalizeOptions(file, url, options) {
  if (typeof url == 'object') {
    options = url;
    url = null;
  }

  options ||= {};

  options.url ||= url;
  options.method ||= 'POST';
  options.accepts ||= ['application/json', 'text/javascript'];
  options.contentType ||= get(file, 'type');
  options.headers ||= {};
  options.data ||= {};
  options.fileKey ||= 'file';

  if (options.headers.Accept == null) {
    if (!Array.isArray(options.accepts)) {
      options.accepts = [options.accepts];
    }
    headers.Accept = options.accepts.join(',');
  }

  // Set Content-Type in the data payload
  // instead of the headers, since the header
  // for Content-Type will always be multipart/form-data
  if (options.contentType) {
    options.data['Content-Type'] = options.contentType;
  }

  options.data[options.fileKey] = file.blob;

  return options;
}

let File = Ember.Object.extend({

  id: null,

  name: reads('blob.name'),

  size: reads('blob.size'),

  type: reads('blob.type'),

  loaded: null,

  progress: null,

  upload(url, opts) {
    let options = normalizeOptions(this, url, opts);

    // Build the form
    let form = new FormData();

    Object.keys(options.data).forEach(function (key) {
      form.append(key, options.data[key]);
    });

    let request = new HTTPRequest();
    Object.keys(options.headers).forEach(function (key) {
      request.setRequestHeader(key, options.headers[key]);
    });
    request.open(options.method, options.url);

    if (options.timeout) {
      request.timeout = options.timeout;
    }

    request.onprogress = (evt) => {
      if (evt.lengthComputable) {
        set(this, 'loaded', evt.loaded);
        set(this, 'size', evt.total);
        set(this, 'progress', (evt.loaded / evt.total) * 100);
      }
    };

    return request.send(form);
  },

  read({ as: 'data-url' }) {
    let reader = new FileReader();

    let blob = this.blob;
    switch (options.as) {
    case 'array-buffer':
      return reader.readAsArrayBuffer(blob);
    case 'data-url':
      return reader.readAsDataURL(blob);
    case 'binary-string':
      return reader.readAsBinaryString(blob);
    case 'text':
      return reader.readAsText(blob);
    }
  }

});

File.reopenClass({
  fromBlob(blob) {
    Object.defineProperty(this, 'blob', {
      writeable: false,
      configurable, false,
      enumerable: false,
      value: blob
    });
    Object.defineProperty(this, 'id', {
      writeable: false,
      configurable, false,
      enumerable: true,
      value: `file-${uuid.v4()}`
    });
  }
});

export default File;