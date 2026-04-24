// ROI: hrs = hours per cycle per person · staff = headcount on process
// Total person-hours = hrs × staff × annual cycles
export const calcROI = (roi) => {
  const annualCycles = roi.vol * 12;
  const totalHrs     = roi.hrs * roi.staff;
  const aiHrs        = totalHrs * 0.03;                                    // 97% reduction
  const hrsSaved     = (totalHrs - aiHrs) * annualCycles;
  const timeSave     = hrsSaved * roi.rate;
  const errSave      = annualCycles * Math.max(0, roi.errPct / 100 - 0.005) * roi.errCost;
  const total        = timeSave + errSave;
  const impl         = Math.max(65000, Math.min(280000, roi.vol * 45 + 40000));
  return {
    timeSave, errSave, total,
    hrsSaved:  Math.round(hrsSaved),
    aiMins:    Math.max(1, Math.round(roi.hrs * 0.03 * 60)),
    impl,
    roiPct:    Math.round((total - impl) / impl * 100),
    payback:   Math.max(1, Math.ceil(impl / (total / 12)))
  };
};

export const fmt  = n => '$' + Math.round(n).toLocaleString();
export const fmtK = n => n >= 1000000 ? '$' + (n/1000000).toFixed(1) + 'M' : n >= 1000 ? '$' + Math.round(n/1000) + 'K' : fmt(n);
