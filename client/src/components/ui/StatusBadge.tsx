interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-[#EEEAFD] text-[#4B2C82]',
  archived: 'bg-gray-100 text-gray-600',
  pending: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  registered: 'bg-[#EEEAFD] text-[#4B2C82]',
  attended: 'bg-green-100 text-green-700',
  student: 'bg-gray-100 text-gray-700',
  member: 'bg-[#EEEAFD] text-[#4B2C82]',
  admin: 'bg-[#9667E0]/15 text-[#4B2C82]',
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-gray-100 text-gray-600';
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-block rounded-full font-medium capitalize ${style} ${sizeClass}`}>
      {status}
    </span>
  );
}

