export const APPLICATION_STATUSES = [
  'Saved',
  'Applied',
  'Interview',
  'Offer',
  'Rejected',
];

export const INITIAL_FORM = {
  company: '',
  title: '',
  url: '',
  status: 'Applied',
  applied_date: '',
  notes: '',
};

export const SUMMARY_ITEMS = [
  { key: 'Saved', icon: '💾', cls: 'badge-saved' },
  { key: 'Applied', icon: '📨', cls: 'badge-applied' },
  { key: 'Interview', icon: '📅', cls: 'badge-interview' },
  { key: 'Offer', icon: '🎉', cls: 'badge-offer' },
  { key: 'Rejected', icon: '⛔', cls: 'badge-rejected' },
];
