export let global = null;
export let runtime = null;
export let settings = null;

class GlobalContext {
  constructor() {
    this._user = null;
    this._state = null;
    this._language = null;
  }

  get user() {
    return this._user;
  }

  set user(value) {
    this._user = value;
  }

  get state() {
    return this._state;
  }

  set state(value) {
    this._state = value;
  }

  get language() {
    return this._language;
  }

  set language(value) {
    this._language = value;
  }
}

class RuntimeContext {
  constructor(containerNodeId) {
    this._containerNodeId = containerNodeId;
    this._serverRenderContainerPattern = new RegExp(`(id=\"${containerNodeId}\"[^\>]*>?)(.*?)(<\/)`);
    this._middleware = [];
    if (this.isClient) {
      this._renderContainerObject = document.getElementById(this.containerNodeId);
    } else {
      var fs = require('fs');
      fs.readFile('./dist/index.html', (err, html) => {
        if (err) {
          throw err;
        }
        //make urls absolute
        html = `${html}`;
        html = html.replace(/"((?:[^"]*?)\.(?:js|css))"/g, '"/$1"')
        this._renderContainerObject = html;
      });
    }
    for (var mid of settings.MIDDLEWARE) {
      this._middleware.push(new mid.default()); //eslint-disable-line new-cap
    }
  }

  get middleware() {
    return this._middleware;
  }

  get containerNodeId() {
    return this._containerNodeId;
  }

  get serverRenderContainerPattern() {
    return this._serverRenderContainerPattern;
  }

  get renderContainerObject() {
    return this._renderContainerObject;
  }

  get isClient() {
    return typeof window !== 'undefined';
  }

  get isServer() {
    return !this.isClient;
  }
}

export function _initContexts(settingsInstance, containerNodeId) {
  settings = settingsInstance;
  global = new GlobalContext();
  runtime = new RuntimeContext(containerNodeId);
}
