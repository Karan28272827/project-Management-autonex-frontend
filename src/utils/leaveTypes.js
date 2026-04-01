export const LEAVE_TYPE_OPTIONS = [
  { value: 'paid', label: 'Paid Leave' },
  { value: 'casual_sick', label: 'Casual/Sick Leave' },
  { value: 'floater', label: 'Floater Leave' },
];

const LEGACY_LEAVE_TYPE_ALIASES = {
  vacation: 'paid',
  casual: 'casual_sick',
  sick: 'casual_sick',
  personal: 'floater',
  emergency: 'floater',
};

const LEAVE_TYPE_LABELS = Object.fromEntries(
  LEAVE_TYPE_OPTIONS.map((option) => [option.value, option.label])
);

const LEAVE_TYPE_BADGES = {
  paid: 'bg-blue-50 text-blue-700',
  casual_sick: 'bg-emerald-50 text-emerald-700',
  floater: 'bg-amber-50 text-amber-700',
};

export const RAZORPAY_NEGATIVE_BALANCE_NOTE =
  'If your leave balance is exhausted, Razorpay may automatically convert this request to unpaid leave, which can affect payroll.';

export function normalizeLeaveType(value) {
  const normalized = (value || '').trim().toLowerCase().replace(/[- ]/g, '_');
  return LEGACY_LEAVE_TYPE_ALIASES[normalized] || normalized;
}

export function getLeaveTypeLabel(value) {
  const normalized = normalizeLeaveType(value);
  return LEAVE_TYPE_LABELS[normalized] || normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getLeaveTypeBadgeClass(value) {
  return LEAVE_TYPE_BADGES[normalizeLeaveType(value)] || 'bg-slate-100 text-slate-600';
}
