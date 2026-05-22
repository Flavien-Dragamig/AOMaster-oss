import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label pour le champ
   */
  label?: string;
  /**
   * Message d'erreur à afficher
   */
  error?: string;
  /**
   * Message d'aide sous le champ
   */
  helpText?: string;
  /**
   * Si le champ prend toute la largeur disponible
   */
  fullWidth?: boolean;
  /**
   * Élément à afficher à gauche du champ
   */
  leftElement?: React.ReactNode;
  /**
   * Élément à afficher à droite du champ
   */
  rightElement?: React.ReactNode;
  /**
   * Classes supplémentaires pour le container
   */
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helpText,
  className = '',
  disabled = false,
  fullWidth = true,
  leftElement,
  rightElement,
  containerClassName = '',
  ...props
}, ref) => {
  // Classes de base pour l'input
  const baseInputClasses = `
    py-2 px-4 block border rounded-md focus:ring-2 focus:ring-peach-500
    focus:border-peach-500 focus:outline-none transition-colors
    disabled:opacity-50 disabled:bg-gray-100 disabled:cursor-not-allowed
  `;
  
  // Gestion des classes pour le statut du champ
  const statusClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300';
  
  // Classes pour le mode fullWidth
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Classes pour les éléments à gauche/droite
  const paddingClasses = leftElement
    ? 'pl-10'
    : rightElement
      ? 'pr-10'
      : '';
  
  // Combinaison des classes
  const inputClasses = `
    ${baseInputClasses}
    ${statusClasses}
    ${widthClasses}
    ${paddingClasses}
    ${className}
  `;

  return (
    <div className={`${containerClassName} ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftElement && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftElement}
          </div>
        )}

        <input
          ref={ref}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
