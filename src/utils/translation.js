import Jed from 'jed';

let dictionaries = {};

export default class {
  constructor() {
    this._language = null;
  }

  get language() {
    return this._language;
  }

  set language(value) {
    if (!dictionaries[value]) {
      try {
        dictionaries[value] = new Jed(require(`__locale_${value}`));
      } catch (ex) {
        console.warn(`Language with code ${value} is not available`);
      }
    }
    this._language = value;
  }

  gettext(msgid) {
    var currentDictionary = dictionaries[this._language];
    if (currentDictionary) {
      return currentDictionary.gettext(msgid);
    }
    return msgid;
  }

  ngettext(singular, plural, count) {
    var currentDictionary = dictionaries[this._language];
    if (currentDictionary) {
      return currentDictionary.ngettext(singular, plural, count);
    }
    return count === 1 ? singular : plural;
  }

  gettext_noop(msgid) { //eslint-disable-line camelcase
    return msgid;
  }

  pgettext(context, msgid) {
    var currentDictionary = dictionaries[this._language];
    if (currentDictionary) {
      return currentDictionary.pgettext(context, msgid);
    }
    return msgid;
  }

  npgettext(context, singular, plural, count) {
    var currentDictionary = dictionaries[this._language];
    if (currentDictionary) {
      return currentDictionary.npgettext(context, singular, plural, count);
    }
    return count === 1 ? singular : plural;
  }
}
