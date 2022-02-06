export type SuccessObserver<T> = (value: T) => void;
export type ErrorObserver = (e: Error | string | unknown) => void;
export type Unsubscription = () => void;

export interface Observer<T> {
  next: SuccessObserver<T>;
  error?: ErrorObserver;
}

export interface Observable<T> {
  subscribe(next: Observer<T> | SuccessObserver<T>, error?: ErrorObserver): void;

  unsubscribe(): void;

  close(): void;
}

export const intervalPolling = <T = unknown>(
  polling: () => Promise<T>,
  interval: number,
  maxCount?: number,
): Observable<T> => {
  let closed = false;
  let pollingTimerId: NodeJS.Timeout;
  const subscribers: Observer<T>[] = [];
  const onNext: SuccessObserver<T> = (value: T): void => {
    subscribers.forEach((subscriber) => {
      if (typeof subscriber.next === 'function') {
        subscriber.next(value);
      }
    });
  };
  const onError: ErrorObserver = (value: Error | string | unknown) => {
    subscribers.forEach((subscriber) => {
      if (typeof subscriber.error === 'function') {
        subscriber.error(value);
      }
    });
  };
  const addSubscription = ({ next, error }: Observer<T>): Observer<T> => {
    if (typeof next !== 'function') {
      throw new Error(`The "next" property must be function`);
    }
    const subscriber: Observer<T> = { next };
    if (typeof error === 'function') {
      subscriber.error = error;
    }
    subscribers.push(subscriber);
    return subscriber;
  };
  const removeSubscription = (subscriber: Observer<T>): void => {
    const index = subscribers.indexOf(subscriber);
    index > -1 && subscribers.splice(index, 1);
  };
  const removeAllSubscription = (): void => {
    subscribers.length = 0;
  };

  (async () => {
    while (!closed) {
      if (typeof maxCount === 'number') {
        if (maxCount > 0) maxCount--;
        else break;
      }

      await polling().then(onNext).catch(onError);

      await new Promise((resolve) => {
        pollingTimerId = setTimeout(resolve, interval);
      });
    }
  })();

  return {
    subscribe(
      observerOrNext: Observer<T> | SuccessObserver<T>,
      error?: ErrorObserver,
    ): Unsubscription {
      let next: SuccessObserver<T>;
      if (typeof observerOrNext === 'function') {
        next = observerOrNext;
      } else if (typeof observerOrNext === 'object') {
        next = observerOrNext.next;
        error = observerOrNext.error;
      } else {
        throw new Error(`The "observerOrNext" argument must be type Function or Object`);
      }
      const addedSubscriber = addSubscription({ next, error });

      return () => removeSubscription(addedSubscriber);
    },
    unsubscribe(): void {
      removeAllSubscription();
    },
    close(): void {
      removeAllSubscription();
      closed = true;
      pollingTimerId && clearTimeout(pollingTimerId);
    },
  };
};
