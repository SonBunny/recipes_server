import argon2 from 'argon2';

class Argon2Hasher {
  async hash(password) {
    console.log(password);
    return argon2.hash(password);
  }
  async verify(hash, password) {
    return argon2.verify(hash, password);
  }
}

export default new Argon2Hasher();
