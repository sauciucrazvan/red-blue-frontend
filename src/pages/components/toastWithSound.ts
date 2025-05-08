import { toast } from 'react-hot-toast';

const errorSound = new Audio('src/assets/wrong-47985.mp3'); // Must be in public folder

export function toastErrorWithSound(message: string) {
  errorSound.currentTime = 0;
  errorSound.volume = 0.5;
  errorSound.play().catch((e) => console.error('Sound play error:', e));
  toast.error(message);
}
