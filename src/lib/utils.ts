import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return crypto.randomUUID();
}

export function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function exportChat(chat: any, format: 'txt' | 'md' = 'md') {
  let content = '';
  if (format === 'md') {
    content = `# ${chat.title}\n\n`;
    chat.messages.forEach((m: any) => {
      content += `**${m.role === 'user' ? 'You' : 'AI'}**:\n${m.text}\n\n---\n\n`;
    });
  } else {
    content = `${chat.title}\n\n`;
    chat.messages.forEach((m: any) => {
      content += `${m.role === 'user' ? 'You' : 'AI'}:\n${m.text}\n\n`;
    });
  }
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
