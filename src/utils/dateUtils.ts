import { formatDistanceToNow } from 'date-fns';

export const formatRelativeTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return formatDistanceToNow(date, { addSuffix: true });
};
