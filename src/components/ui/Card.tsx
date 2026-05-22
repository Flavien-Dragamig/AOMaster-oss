import React from 'react';

// Types pour les sous-composants
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBadgeProps {
  children: React.ReactNode;
  className?: string;
  status?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

interface CardActionsProps {
  children: React.ReactNode;
  className?: string;
}

// Type principal pour Card
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'elevated' | 'flat';
  withHover?: boolean;
  withBorder?: boolean;
}

// Composant principal
export const Card: React.FC<CardProps> & {
  Header: React.FC<CardHeaderProps>;
  Title: React.FC<CardTitleProps>;
  Description: React.FC<CardDescriptionProps>;
  Content: React.FC<CardContentProps>;
  Footer: React.FC<CardFooterProps>;
  Badge: React.FC<CardBadgeProps>;
  Actions: React.FC<CardActionsProps>;
} = ({
  children,
  className = '',
  variant = 'default',
  withHover = false,
  withBorder = true,
  ...props
}) => {
  // Classes de base pour tous les cards
  const baseClasses = 'rounded-lg overflow-hidden';
  
  // Classes de variantes
  const variantClasses = {
    default: 'bg-white',
    outline: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md',
    flat: 'bg-gray-50',
  };
  
  // Classes optionnelles
  const hoverClasses = withHover
    ? 'hover:shadow-lg transition-shadow duration-300'
    : '';
  
  const borderClasses = withBorder && variant !== 'outline'
    ? 'border border-gray-200'
    : '';
  
  // Combinaison des classes
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${hoverClasses}
    ${borderClasses}
    ${className}
  `;

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

// Sous-composants
Card.Header = ({ children, className = '', ...props }: CardHeaderProps) => {
  return (
    <div className={`p-6 pb-0 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Title = ({ children, className = '', ...props }: CardTitleProps) => {
  return (
    <h3 className={`text-lg font-bold text-gray-800 ${className}`} {...props}>
      {children}
    </h3>
  );
};

Card.Description = ({ children, className = '', ...props }: CardDescriptionProps) => {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

Card.Content = ({ children, className = '', ...props }: CardContentProps) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Footer = ({ children, className = '', ...props }: CardFooterProps) => {
  return (
    <div className={`p-6 pt-0 mt-auto border-t border-gray-100 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Badge = ({ children, className = '', status = 'default', ...props }: CardBadgeProps) => {
  // Classes pour les statuts de badge
  const statusClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses[status]} ${className}`} {...props}>
      {children}
    </span>
  );
};

Card.Actions = ({ children, className = '', ...props }: CardActionsProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
