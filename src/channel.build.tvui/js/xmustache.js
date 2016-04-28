import Utility from './utility';
import Mustache from 'mustache';

const toJson = function (view) {
  return Utility.escapeHtml(JSON.stringify(view));
};

const _render = Mustache.render;
Mustache.render = function (template, view, partials) {
  if (Array.isArray(view)) {
    view = view.map((v) => { v.json = toJson(v); return v; });
  }
  view.json = toJson(view);
  return _render(template, view, partials);
};

module.exports = Mustache;
