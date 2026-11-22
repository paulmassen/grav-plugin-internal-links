const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
let Component;
class HTMLElement {}
const window = { __GRAV_MODAL_TAG: 'grav-internal-links--modal-page-picker', __GRAV_API_SERVER_URL: 'https://example.test/sub', location: { href: 'https://example.test/sub/admin' } };
const customElements = { get() {}, define(_name, klass) { Component = klass; } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../admin-next/modals/page-picker.js'), 'utf8'), { window, customElements, HTMLElement, URL, URLSearchParams, CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } } });
function run(doc, from, to, route, changed = false) {
  let transaction, event;
  const state = { doc: { toString: () => changed ? doc + '!' : doc }, selection: { main: { from, to } }, sliceDoc: (a, b) => doc.slice(a, b) };
  const view = { dom: { isConnected: true }, state, dispatch(value) { transaction = value; }, focus() {} };
  const picker = new Component();
  picker.view = view;
  picker.snapshot = { from, to, doc };
  picker.status = {};
  picker.dispatchEvent = e => { event = e; };
  picker.insert(route);
  return { transaction, event, status: picker.status.textContent };
}
let result = run('Bonjour monde', 8, 13, '/contact');
assert.equal(result.transaction.changes.insert, '[monde](/sub/contact)');
assert.equal(result.event.type, 'resolve');
assert.equal(result.event.detail.insertContent, undefined);
result = run('Bonjour', 7, 7, '/');
assert.equal(result.transaction.changes.insert, '[](/sub/)');
assert.equal(result.transaction.selection.anchor, 8);
result = run('A [B]', 0, 5, '/ma page');
assert.equal(result.transaction.changes.insert, '[A \\[B\\]](/sub/ma%20page)');
result = run('Texte', 0, 5, '/page(1)');
assert.equal(result.transaction.changes.insert, '[Texte](/sub/page%281%29)');
result = run('Bonjour', 0, 7, '/contact', true);
assert.equal(result.transaction, undefined);
assert.match(result.status, /changé/);
console.log('modal insertion tests: OK');
