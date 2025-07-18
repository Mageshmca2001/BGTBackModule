// src/utils/shiftUtils.js
export const shiftTimes = {
Shift1: { start: '06:00', end: '14:00' },
Shift2: { start: '14:00', end: '22:00' },
Shift3: { start: '22:00', end: '06:00' },
};

export const isTimeInShift = (time, shift) => {
if (shift === 'All') return true;
const { start, end } = shiftTimes[shift];
if (start < end) return time >= start && time < end;
return time >= start || time < end;
};
