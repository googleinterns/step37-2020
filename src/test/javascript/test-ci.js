const assert = require('assert')

describe('Should pass', () => {
  it('Pass addition', () => {
    assert.strictEqual(1 + 1, 2);
  });
  it('Pass equality', () => {
    assert.strictEqual('hey', 'hey');
  });
});

describe('Should fail', () => {
  it('pass 1', () => {
    assert.strictEqual(1, 1);
  });
  /* it('fail 1', () => {
    assert.strictEqual(2, 3);
  }) */
});
