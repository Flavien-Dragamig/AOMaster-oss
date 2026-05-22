import React from 'react';

export interface BadgeProps {
  /**
   * Contenu du badge
   */
  children: React.ReactNode;
  /**
   * Variante visuelle du badge
   */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  /**
   * Taille du badge
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Classes CSS personnalisées
   */
  className?: string;
  /**
   * Si le badge est arrondi en forme de cercle
   */
  rounded?: boolean;
  /**
   * Si le badge a une bordure au lieu d'un fond plein
   */
  outline?: boolean;
  /**
   * Icône à afficher avant le texte
   */
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  rounded = false,
  outline = false,
  icon,
  ...props
}) => {
  // Classes de base pour tous les badges
  const baseClasses = 'inline-flex items-center font-medium';
  
  // Classes de variantes en mode rempli
  const filledVariantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-peach-100 text-peach-800',
    secondary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-sky-100 text-sky-800',
  };
  
  // Classes de variantes en mode outline
  const outlineVariantClasses = {
    default: 'bg-transparent border border-gray-300 text-gray-700',
    primary: 'bg-transparent border border-peach-300 text-peach-700',
    secondary: 'bg-transparent border border-blue-300 text-blue-700',
    success: 'bg-transparent border border-green-300 text-green-700',
    warning: 'bg-transparent border border-amber-300 text-amber-700',
    danger: 'bg-transparent border border-red-300 text-red-700',
    info: 'bg-transparent border border-sky-300 text-sky-700',
  };
  
  // Sélection des classes de variante selon le mode
  const variantClasses = outline
    ? outlineVariantClasses[variant]
    : filledVariantClasses[variant];
  
  // Classes de taille
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };
  
  // Classes pour l'arrondissement
  const roundedClasses = rounded ? 'rounded-full' : 'rounded';
  
  // Combinaison des classes
  const badgeClasses = `
    ${baseClasses}
    ${variantClasses}
    ${sizeClasses[size]}
    ${roundedClasses}
    ${className}
  `;

  return (
    <span className={badgeClasses} {...props}>
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
