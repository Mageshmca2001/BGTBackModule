const ThresholdInput = ({ value, onChange }) => {
return (
<div className="flex flex-col">
<label className="text-sm font-medium text-gray-700 mb-1">Threshold Point</label>
<input
type="number"
value={value}
onChange={(e) => onChange(Number(e.target.value))}
className="border border-gray-300 rounded px-3 py-2 w-32 text-sm"
placeholder="5000"
/>
</div>
);
};

export default ThresholdInput;
