# IntervalPolling

Позволяет с интервалом выполнять асинхронную функцию

```typescript
import { intervalPolling } from 'interval-polling';

intervalPolling(fetch("https://..."), 5000)
  .error((e) => console.log(e))
  .next((res) => console.log(res))

// Завершение опроса
intervalPolling.close();
```
