<section className="bg-white rounded-2xl shadow-lg p-6 mt-4 font-poppins">
  <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
    Meter Analysis Dashboard
  </h2>

  <div className="grid grid-cols-1 gap-6 font-poppins">
    <div className="relative flex justify-center items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-700 text-center">
        {['Present Week', 'Previous Week'].includes(selectedRange)
          ? 'Weekly Progress & Breakdown: '
          : 'Hourly Progress & Breakdown: '}
        <span className="inline-block text-primary">
          [Completed, Functional, Calibration, Accuracy, NIC, FinalTest]
        </span>
      </h3>

      {selectedRange === 'Day' && (
        <div className="absolute right-0">
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm bg-white shadow"
          >
            <option value="All">All Shifts</option>
            <option value="Shift1">06:00 - 14:00</option>
            <option value="Shift2">14:00 - 22:00</option>
            <option value="Shift3">22:00 - 06:00</option>
          </select>
        </div>
      )}
    </div>

    <motion.div
      key={`${selectedRange}-chart-${refreshKey}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full overflow-x-auto py-6">
        <div
          className={`h-[300px] ${
            ['Present Week', 'Previous Week'].includes(selectedRange)
              ? 'w-full'
              : filteredHourlyDetails.length >= 24
              ? 'min-w-[2400px]'
              : 'w-full'
          }`}
        >
          <Bar
            data={{
              labels: ['Present Week', 'Previous Week'].includes(selectedRange)
                ? data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']
                    ?.dailyCompleted?.map((d) =>
                      new Date(d.date).toLocaleDateString('en-GB', {
                        weekday: 'long',
                      })
                    ) || []
                : filteredHourlyDetails
                    .map((item, i, arr) => {
                      const current = item.time;
                      const next = arr[(i + 1) % arr.length]?.time;
                      return `${current} - ${next}`;
                    })
                    .slice(0, -1) || [],
              datasets: (() => {
                const colors = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6'];
                const shiftTimes = {
                  Shift1: { start: '06:00', end: '14:00' },
                  Shift2: { start: '14:00', end: '22:00' },
                  Shift3: { start: '22:00', end: '06:00' },
                };

                const completedData = ['Present Week', 'Previous Week'].includes(selectedRange)
                  ? data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']
                      ?.dailyCompleted?.map((d) => d.value) || []
                  : filteredHourlyDetails
                      .filter((item) => {
                        const time = item.time;
                        if (selectedShift === 'All') return true;
                        const { start, end } = shiftTimes[selectedShift];
                        if (start < end) return time >= start && time < end;
                        return time >= start || time < end;
                      })
                      .map((item) =>
                        Object.values(item)
                          .filter((v) => typeof v === 'number' && !isNaN(v))
                          .reduce((a, b) => a + b, 0)
                      );

                const breakdownData = ['Present Week', 'Previous Week'].includes(selectedRange)
                  ? (() => {
                      const weekData =
                        data?.[selectedRange === 'Present Week' ? 'presentWeek' : 'previousWeek']
                          ?.dailyCompleted || [];
                      const summary = weekData.reduce(
                        (acc, day) => {
                          acc.Functional.push(day.value * 0.4);
                          acc.Calibration.push(day.value * 0.2);
                          acc.Accuracy.push(day.value * 0.2);
                          acc.NIC.push(day.value * 0.1);
                          acc.FinalTest.push(day.value * 0.1);
                          return acc;
                        },
                        {
                          Functional: [],
                          Calibration: [],
                          Accuracy: [],
                          NIC: [],
                          FinalTest: [],
                        }
                      );
                      return summary;
                    })()
                  : breakdownFields.reduce((acc, key) => {
                      acc[key] = filteredHourlyDetails
                        .filter((item) => {
                          const time = item.time;
                          if (selectedShift === 'All') return true;
                          const { start, end } = shiftTimes[selectedShift];
                          if (start < end) return time >= start && time < end;
                          return time >= start || time < end;
                        })
                        .map((item) => item[key]);
                      return acc;
                    }, {});

                return [
                  {
                    label: 'Completed',
                    data: completedData,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: 'rgba(22, 163, 74, 1)',
                    borderWidth: 1,
                    barThickness: 18,
                    categoryPercentage: 0.7,
                    barPercentage: 0.9,
                    borderRadius: 0,
                  },
                  ...breakdownFields.map((key, i) => ({
                    label: key,
                    data: breakdownData[key] || [],
                    backgroundColor: colors[i],
                    barThickness: 18,
                    categoryPercentage: 0.7,
                    barPercentage: 0.9,
                    borderRadius: 0,
                  })),
                  {
                    label: 'Tracking Line',
                    data: completedData,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.3,
                    type: 'line',
                  },
                  {
                    label: 'Threshold',
                    data: Array(completedData.length).fill(redLineValue),
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    type: 'line',
                  },
                ];
              })(),
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    font: { family: 'Poppins', size: 13 },
                  },
                },
              tooltip: {
                      enabled: true,
                      mode: 'index',
                      intersect: false,
                      callbacks: {
                        label: function (context) {
                          const label = context.dataset.label || '';
                          const value = context.parsed.y;
                          if (label === 'Tracking Line') return '';
                          if (label === 'Threshold') return `🔴 ${label}: ${value}`;
                          if (label === 'Completed') return `🟢 ${label}: ${value}`;
                          return `${label}: ${value}`;
                        },
                      },
                  titleFont: { family: 'Poppins', size: 14, weight: 'bold' },
                  bodyFont: { family: 'Poppins', size: 13 },
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  titleColor: '#111827',
                  bodyColor: '#1F2937',
                  borderColor: '#E5E7EB',
                  borderWidth: 1,
                  padding: 10,
                  cornerRadius: 8,
                  boxPadding: 4,
                },
              },
              interaction: {
                mode: 'index',
                intersect: false,
              },
              scales: {
                x: {
                  ticks: {
                    font: { family: 'Poppins' },
                  },
                },
                y: {
                  beginAtZero: true,
                  suggestedMax: redLineValue + 500,
                  ticks: {
                    stepSize: 200,
                    font: { family: 'Poppins' },
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </motion.div>
  </div>
</section>