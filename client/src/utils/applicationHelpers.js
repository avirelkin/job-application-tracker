export function toDateInputValue(appliedDate) {
  if (!appliedDate) return '';
  return String(appliedDate).slice(0, 10);
}

export function getStatusCounts(applications) {
  const counts = {
    Saved: 0,
    Applied: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
    Total: 0,
  };

  for (const app of applications) {
    counts.Total += 1;
    if (counts[app.status] !== undefined) {
      counts[app.status] += 1;
    }
  }

  return counts;
}

export function sortApplications(applications, statusSort, sortBy, sort) {
  const arr = [...applications];

  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  return arr.sort((a, b) => {
    for (const s of statusSort) {
      const aKey = a.status === s ? 0 : 1;
      const bKey = b.status === s ? 0 : 1;

      if (aKey !== bKey) {
        return aKey - bKey;
      }
    }

    const av = a?.[sortBy] ?? '';
    const bv = b?.[sortBy] ?? '';
    const base = cmp(av, bv);

    return sort === 'asc' ? base : -base;
  });
}
export function toApplicationFormValues(app) {
  return {
    company: app.company || '',
    title: app.title || '',
    url: app.url || '',
    status: app.status || 'Applied',
    applied_date: toDateInputValue(app.applied_date),
    notes: app.notes || '',
  };
}
