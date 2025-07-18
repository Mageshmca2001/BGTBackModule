// src/hooks/useTimeLabels.js
import { isTimeInShift } from '../utils/shift.js'

export const useTimeLabels = ({ selectedRange, data, selectedShift, filteredHourlyDetails }) => {
if (['Present Week', 'Previous Week'].includes(selectedRange)) {
return (
data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']?.dailyCompleted?.map((d) =>
new Date(d.date).toLocaleDateString('en-GB', { weekday: 'long' })
) || []
);
}

const shiftFiltered = filteredHourlyDetails.filter((item) =>
isTimeInShift(item.time, selectedShift)
);

const hours = selectedShift === 'All'
? shiftFiltered.slice(0, 25)
: shiftFiltered;

return hours
.map((item, i) => {
const current = item.time;
const next = hours[i + 1]?.time;

if (!next) {
if (selectedShift === 'Shift1') return `${current} - 14:00`;
if (selectedShift === 'Shift2') return `${current} - 22:00`;
if (selectedShift === 'Shift3') return `${current} - 06:00`;
return null;
}

return `${current} - ${next}`;
})
.filter(Boolean);
};
