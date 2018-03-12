// License (MIT)
// Copyright (c) 2013-2014 Christopher Simpkins

const globalTimeoutConfig = {
  bootstrap: {
    millis: 4000,
    dieOnTimeout: false,
  },
  mount: {
    millis: 3000,
    dieOnTimeout: false,
  },
  unmount: {
    millis: 3000,
    dieOnTimeout: false,
  },
  unload: {
    millis: 3000,
    dieOnTimeout: false,
  },
};

export function reasonableTime(promise, description, timeoutConfig, app?) {
  const warningPeriod = 1000;

  return new Promise((resolve, reject) => {
    let finished = false;
    let errored = false;

    promise
      .then(val => {
        finished = true;
        resolve(val);
      })
      .catch(val => {
        finished = true;
        reject(val);
      });

    setTimeout(() => maybeTimingOut(1), warningPeriod);
    setTimeout(() => maybeTimingOut(true), timeoutConfig.millis);

    function maybeTimingOut(shouldError) {
      if (!finished) {
        if (shouldError === true) {
          errored = true;
          if (timeoutConfig.dieOnTimeout) {
            reject(`${description} did not resolve or reject for ${timeoutConfig.millis} milliseconds`);
          } else {
            // don't resolve or reject, we're waiting this one out
            console.error(`${description} did not resolve or reject for ${timeoutConfig.millis}`
              + `milliseconds -- \n            we're no longer going to warn you about it.`);
          }
        } else if (!errored) {
          const numWarnings = shouldError;
          const numMillis = numWarnings * warningPeriod;
          console.warn(`${description} did not resolve or reject within ${numMillis} milliseconds`);
          if (numMillis + warningPeriod < timeoutConfig.millis) {
            setTimeout(() => maybeTimingOut(numWarnings + 1), warningPeriod);
          }
        }
      }
    }
  });
}

export function ensureValidAppTimeouts(timeouts = {}) {
  return {
    ...globalTimeoutConfig,
    ...timeouts,
  };
}
