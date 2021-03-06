suite('Named System.register', function() {
  test('Loading a named System.register bundle', function () {
    return System.import('./fixtures/browser/named-bundle.js').then(function (m) {
      assert.equal(Object.keys(m).length, 0);
      return System.import('a');
    })
    .then(function (m) {
      assert.equal(m.a, 'b');
    });
  });

  test('Loading a named AMD bundle', function () {
    return System.import('./fixtures/browser/named-amd.js').then(function (m) {
      assert.equal(Object.keys(m).length, 1);
      return System.import('c');
    })
    .then(function (m) {
      assert.equal(m.default.a, 'b');
    });
  });
});