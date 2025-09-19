interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 whitespace-pre-line">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-gray-400">📧</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>

        <p className="text-gray-600 mb-8 leading-relaxed">{description}</p>

        {action && (
          <a
            href={action.href}
            className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 transition-colors"
          >
            {action.label}
          </a>
        )}
      </div>
    </div>
  );
}
