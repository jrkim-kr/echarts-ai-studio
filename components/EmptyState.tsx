'use client';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-blue-100 p-16 text-center h-full flex items-center justify-center">
      <div className="max-w-md mx-auto">
        {icon || (
          <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {description.split('**').map((part, i) => 
            i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-700">{part}</strong> : part
          )}
        </p>
      </div>
    </div>
  );
}

