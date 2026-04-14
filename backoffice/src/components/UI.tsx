import React from "react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export const SectionHeader = ({ title, subtitle, actions }: SectionHeaderProps) => (
  <div className="section-header">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </div>
    {actions ? <div className="section-actions">{actions}</div> : null}
  </div>
);

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card = ({ children, className = "" }: CardProps) => (
  <section className={`card ${className}`.trim()}>{children}</section>
);

type FieldProps = {
  label: string;
  help?: string;
  children: React.ReactNode;
};

export const Field = ({ label, help, children }: FieldProps) => (
  <label className="field">
    <span className="field-label">{label}</span>
    {children}
    {help ? <span className="field-help">{help}</span> : null}
  </label>
);

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export const Input = ({ className = "", ...props }: InputProps) => (
  <input className={`input ${className}`.trim()} {...props} />
);

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export const TextArea = ({ className = "", ...props }: TextAreaProps) => (
  <textarea className={`textarea ${className}`.trim()} {...props} />
);

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;
export const Select = ({ className = "", ...props }: SelectProps) => (
  <select className={`select ${className}`.trim()} {...props} />
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export const Button = ({ variant = "primary", className = "", ...props }: ButtonProps) => (
  <button className={`button ${variant} ${className}`.trim()} {...props} />
);

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "primary";
};

export const Badge = ({ children, tone = "neutral" }: BadgeProps) => (
  <span className={`badge ${tone}`.trim()}>{children}</span>
);

export const EmptyState = ({ children }: { children: React.ReactNode }) => (
  <div className="empty-state">{children}</div>
);
