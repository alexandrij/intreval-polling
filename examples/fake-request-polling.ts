import { intervalPolling } from 'interval-polling';

interface User {
  id: number,
  name: string
}

const fakeRequest = async (): Promise<User> => {
  let i = 0;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      i++ > 3 ? resolve({ id: i, name: 'Alexandr' }) : reject('Error request');
    }, 1000);
  });
}

intervalPolling<User>(fakeRequest, 1000).subscribe({
  next: (resp) => {
    console.log(`[success]`, resp);
  },
  error: (e) => {
    console.log(`[failure]`, e);
  },
})
