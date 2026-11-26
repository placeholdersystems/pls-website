/*!
 * toasts.js — dependency-free notification toasts. Requires toasts.css.
 *
 * Toast.show({ type, title, message, primary, secondary, onPrimary, onSecondary, duration, container })
 * Toast.danger(message, opts) | Toast.warning(...) | Toast.success(...) | Toast.info(...)
 * Toast.clear()
 *
 * type: 'danger' | 'warning' | 'success' | 'info' (default 'info')
 * primary / secondary: button label strings; omit to hide the button
 * duration: ms until auto-dismiss; 0 or omitted = stays until closed
 * container: an element to render into inline; default is a fixed top-right stack
 */
(function (root) {
  'use strict';

  var SVG = 'http://www.w3.org/2000/svg';
  var ICONS = {
    danger:  '<polygon points="7.9 2 16.1 2 22 7.9 22 16.1 16.1 22 7.9 22 2 16.1 2 7.9"/><line x1="12" y1="7.5" x2="12" y2="13"/><circle cx="12" cy="16.5" r=".6" fill="currentColor"/>',
    warning: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9.5" x2="12" y2="14"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>',
    success: '<circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/>',
    info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="11" x2="12" y2="16.5"/><circle cx="12" cy="7.8" r=".6" fill="currentColor"/>'
  };
  var CLOSE = '<path d="M3 3l10 10M13 3L3 13"/>';
  var stack = null;

  function svg(inner, cls, viewBox, strokeWidth) {
    var el = document.createElementNS(SVG, 'svg');
    el.setAttribute('viewBox', viewBox);
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke', 'currentColor');
    el.setAttribute('stroke-width', strokeWidth);
    el.setAttribute('stroke-linecap', 'round');
    el.setAttribute('stroke-linejoin', 'round');
    el.setAttribute('aria-hidden', 'true');
    if (cls) el.setAttribute('class', cls);
    el.innerHTML = inner;
    return el;
  }

  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function getStack() {
    if (stack && document.body.contains(stack)) return stack;
    stack = node('div', 'ui-toast-stack');
    stack.setAttribute('aria-live', 'polite');
    document.body.appendChild(stack);
    return stack;
  }

  function show(opts) {
    opts = opts || {};
    var type = ICONS[opts.type] ? opts.type : 'info';
    var host = opts.container;
    if (host) host.classList.add('ui-toast-stack', 'ui-toast-inline');
    else host = getStack();

    var el = node('div', 'ui-toast ui-toast-' + type);
    el.setAttribute('role', type === 'danger' || type === 'warning' ? 'alert' : 'status');

    el.appendChild(svg(ICONS[type], 'ui-toast-icon', '0 0 24 24', '2'));

    var body = node('div', 'ui-toast-body');
    if (opts.title) body.appendChild(node('strong', 'ui-toast-title', opts.title));
    if (opts.message) body.appendChild(node('span', 'ui-toast-message', opts.message));
    el.appendChild(body);

    function dismiss() { if (el.parentNode) el.parentNode.removeChild(el); }

    var hasP = typeof opts.primary === 'string', hasS = typeof opts.secondary === 'string';
    if (hasP || hasS) {
      var acts = node('div', 'ui-toast-actions');
      if (hasP) {
        var p = node('button', 'ui-toast-btn ui-toast-cta', opts.primary);
        p.type = 'button';
        p.addEventListener('click', function () { if (opts.onPrimary) opts.onPrimary(el); dismiss(); });
        acts.appendChild(p);
      }
      if (hasS) {
        var s = node('button', 'ui-toast-btn', opts.secondary);
        s.type = 'button';
        s.addEventListener('click', function () { if (opts.onSecondary) opts.onSecondary(el); dismiss(); });
        acts.appendChild(s);
      }
      el.appendChild(acts);
    }

    var x = node('button', 'ui-toast-close');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    x.appendChild(svg(CLOSE, '', '0 0 16 16', '2'));
    x.addEventListener('click', dismiss);
    el.appendChild(x);

    host.appendChild(el);
    if (opts.duration > 0) setTimeout(dismiss, opts.duration);
    return { element: el, close: dismiss };
  }

  function shorthand(type) {
    return function (message, opts) {
      opts = opts || {};
      opts.type = type;
      opts.message = message;
      return show(opts);
    };
  }

  root.Toast = {
    show: show,
    danger: shorthand('danger'),
    warning: shorthand('warning'),
    success: shorthand('success'),
    info: shorthand('info'),
    clear: function () { if (stack) stack.innerHTML = ''; }
  };
})(typeof window !== 'undefined' ? window : this);
