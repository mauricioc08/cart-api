const locks = new Map();

/**
 * @param {string|number} key
 * @returns {boolean} 
 */

function acquireLock(key) {
  if (locks.has(key)) {
    return false; 
  }
  locks.set(key, true);
  return true;
}

/**
 * @param {string|number} key
 */

function releaseLock(key) {
  locks.delete(key);
}

module.exports = { acquireLock, releaseLock };
