import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Variante visuelle du bouton
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
  /**
   * Taille du bouton
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Contenu du bouton
   */
  children: React.ReactNode;
  /**
   * Si le bouton est en état de chargement
   */
  isLoading?: boolean;
  /**
   * Si le bouton prend toute la largeur disponible
   */
  fullWidth?: boolean;
  /**
   * Icon à afficher avant le texte (élément React)
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon à afficher après le texte (élément React)
   */
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  type = 'button',
  ...props
}) => {
  // Base classes pour tous les boutons
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500 disabled:opacity-50 disabled:pointer-events-none';
  
  // Classes de variantes
  const variantClasses = {
    primary: 'bg-peach-600 text-white hover:bg-peach-700 active:bg-peach-800',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
    link: 'bg-transparent text-peach-600 hover:underline p-0 hover:bg-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  };
  
  // Classes de taille
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5 rounded',
    md: 'text-base px-4 py-2 rounded-md',
    lg: 'text-lg px-5 py-2.5 rounded-md',
  };

  // Classe pour le mode fullWidth
  const widthClass = fullWidth ? 'w-full' : '';

  // Combinaison des classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${className}
  `;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {!isLoading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}
      {children}
      {!isLoading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
