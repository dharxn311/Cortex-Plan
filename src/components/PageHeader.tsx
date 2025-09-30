import React from 'react';
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}
export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 md:mb-12">
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}