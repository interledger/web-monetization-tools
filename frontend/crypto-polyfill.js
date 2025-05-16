export default {
  subtle: crypto.subtle,
  getRandomValues: crypto.getRandomValues.bind(crypto),
  randomUUID: crypto.randomUUID.bind(crypto),

  sign: function(algorithm, privateKey, data) {
    return crypto.subtle.sign(
      algorithm,
      privateKey,
      data
    );
  },

  randomBytes: (size) => {
    const array = new Uint8Array(size);
    crypto.getRandomValues(array);
    return array;
  },

  createSign: () => {
    throw new Error('[polyfill] crypto.createSign is not implemented yet!');
  }
}