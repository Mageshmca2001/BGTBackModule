export const config = {
  chart: {
    pieCutout: '60%',
    pieColors: ['rgba(34,197,94,0.85)', 'rgba(239,68,68,0.85)'],
    barColors: {
      completed: 'rgba(34,197,94,0.7)',
      threshold: 'rgba(239,68,68,1)',
      tracking: 'rgba(59,130,246,1)'
    }
  },
  animation: {
    duration: 800,
    easing: 'easeOutCubic'
  },
  layout: {
    cardShadow: 'shadow-lg',
    sectionPadding: 'p-6',
    gap: 'gap-6',
    chartHeight: 'h-[300px]',
    borderRadius: 'rounded-2xl'
  },
  refreshIntervals: {
    clock: 1000,
    fetch: 10000
  }
};
