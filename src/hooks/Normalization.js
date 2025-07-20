// utils/normalizeTestData.js
export const normalizeTestData = (rawData) => {
const shifts = ["06-14", "14-22", "22-06"];
const statuses = ["Total", "PASS", "FAIL"];
const testTypes = Object.keys(rawData);

const result = {};

testTypes.forEach((testType) => {
const shiftData = rawData[testType];
result[testType] = {
"06-14": {},
"14-22": {},
"22-06": {},
};

shiftData.forEach(({ Shift, Status, MeterCount }) => {
result[testType][Shift][Status] = MeterCount;
});

// Fill in missing data
shifts.forEach((shift) => {
statuses.forEach((status) => {
if (result[testType][shift][status] === undefined) {
result[testType][shift][status] = 0;
}
});
});
});

return result;
};
