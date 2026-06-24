const NOTIFICATION_SRC = '/sounds/notification.wav';

let audioInstance = null;

export function playNotificationSound() {
  try {
    if (!audioInstance) {
      audioInstance = new Audio(NOTIFICATION_SRC);
      audioInstance.volume = 1;
    }
    audioInstance.currentTime = 0;
    const playPromise = audioInstance.play();
    if (playPromise) {
      playPromise.catch(() => {
        /* autoplay blocked until user interaction */
      });
    }
  } catch {
    /* ignore */
  }
}

export function primeNotificationSound() {
  if (!audioInstance) {
    audioInstance = new Audio(NOTIFICATION_SRC);
    audioInstance.volume = 0.01;
    audioInstance.play().then(() => {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      audioInstance.volume = 1;
    }).catch(() => {});
  }
}
