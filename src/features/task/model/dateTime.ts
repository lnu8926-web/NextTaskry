export const dateTimeUtils = {
  toISOString: (dateStr: string, timeStr?: string) => {
    const time = timeStr || "00:00";
    return `${dateStr}T${time}:00.000Z`;
  },

  parseDateTime: (isoString?: string | null) => {
    if (!isoString) return { date: "", time: "", hasTime: false };

    const [datePart, timePart] = isoString.split("T");
    const [hours, minutes] = timePart.split(":");

    return {
      date: datePart,
      time: `${hours}:${minutes}`,
      hasTime: hours !== "00" || minutes !== "00",
    };
  },
} as const;
