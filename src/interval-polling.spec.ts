import { intervalPolling } from './interval-polling';

interface User {
  id: number,
  name: string
}

const fakeRequest = (() => {
  let i = 0;
  return async (): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: ++i, name: `User` });
      }, 100);
    });
  }
})()

describe('testing the polling and close', () => {
  it('testing the count polling', async () => {
    let maxCount = 5;
    return expect(new Promise((resolve) => {
      let i = 0;
      const polling = intervalPolling(fakeRequest, 200);
      polling.subscribe(() => {
        if (++i >= maxCount) {
          polling.close();
          resolve(i);
        }
      });
    })).resolves.toBe(maxCount)
  });

  it('testing correct data', async () => {
    let maxCount = 5;
    return expect(new Promise((resolve) => {
      const polling = intervalPolling(fakeRequest, 200, maxCount);
      polling.subscribe((data) => {
        resolve(JSON.stringify(data));
      });
    })).resolves.toBe(JSON.stringify({ id: maxCount + 1, name: 'User' }))
  })
})