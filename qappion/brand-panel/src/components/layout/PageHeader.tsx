import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

export function PageHeader({ title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumb && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumb.map((item, index) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {item.href ? (
                  <a href={item.href} className="text-slate-500 hover:text-slate-700 text-sm font-medium">
                    {item.label}
                  </a>
                ) : (
                  <span className="text-slate-700 text-sm font-medium">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
