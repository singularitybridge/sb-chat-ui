export const convertToStringArray = <T>(items: T[]): string[] => {
  return items.map((item) => String(item));
};
