import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// tailwind-merge only knows Tailwind's default scale. Without this it reads
// `text-page` as a colour and silently drops `text-fg` from the same element.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display',
        'stat',
        'page',
        'section',
        'title',
        'body',
        'label',
        'helper',
        'control',
        'article',
        'article-display',
        'article-title',
      ],
      shadow: ['menu', 'dialog'],
    },
  },
});

// Joins class names and lets later classes override earlier ones, so a
// component's `className` prop can override its defaults. shadcn calls it cn.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
