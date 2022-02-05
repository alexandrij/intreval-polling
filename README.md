# IntervalPolling

Позволяет с заданным интервалом выполнять запросы

```typescript
import { intervalPolling } from 'interval-polling';


const fakeRequest = async () => {
  //return fetch('http://');  
  let i = 0;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      i%3 ? resolve({ id: i, name: 'Aleksei' }) : reject('Error request');
    }, 1000);
  });
}

intervalPolling(fetch("https://..."), 5000)
  .error((e) => console.log(e))
  .next((res) => console.log(res))

// Завершение опроса
intervalPolling.close();
```
