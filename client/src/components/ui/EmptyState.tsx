interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-[#1A0B2E] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[#2D164B]/60 text-center max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-[#9667E0] text-white text-sm rounded-lg hover:bg-[#4B2C82] transition"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
