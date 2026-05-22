import React, { Fragment, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  /**
   * Si le modal est visible
   */
  isOpen: boolean;
  /**
   * Callback appelé lorsque le modal est fermé
   */
  onClose: () => void;
  /**
   * Titre du modal
   */
  title?: React.ReactNode;
  /**
   * Contenu du modal
   */
  children: React.ReactNode;
  /**
   * Taille du modal
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /**
   * Si le clic en dehors du modal doit le fermer
   */
  closeOnClickOutside?: boolean;
  /**
   * Si appuyer sur Escape doit fermer le modal
   */
  closeOnEsc?: boolean;
  /**
   * Classes additionnelles pour le modal
   */
  className?: string;
  /**
   * Si le modal doit avoir un footer
   */
  footer?: React.ReactNode;
  /**
   * Si la fermeture du modal est désactivée (aucun bouton X)
   */
  hideCloseButton?: boolean;
  /**
   * Si le modal doit être centré
   */
  centered?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  className = '',
  footer,
  hideCloseButton = false,
  centered = true,
  ...props
}) => {
  // Référence pour le contenu du modal
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Gestionnaire pour la touche Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && closeOnEsc) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEsc]);
  
  // Empêcher le scroll du body lorsque le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Si le modal n'est pas ouvert, ne pas le rendre
  if (!isOpen) {
    return null;
  }

  // Classes de taille pour le modal
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full w-full h-full',
  };
  
  // Classes pour le centrage vertical
  const centeringClasses = centered
    ? 'items-center'
    : 'items-start mt-10';

  // Gestion du clic en dehors du modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <Fragment>
      {/* Fond semi-transparent */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center overflow-y-auto p-4"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
      >
        {/* Container du modal */}
        <div className={`${centeringClasses} w-full h-full flex justify-center`}>
          {/* Modal lui-même */}
          <div
            ref={modalRef}
            className={`
              ${sizeClasses[size]}
              bg-white rounded-lg shadow-xl relative overflow-hidden w-full
              flex flex-col ${size === 'full' ? '' : 'my-auto'}
              ${className}
            `}
            {...props}
          >
            {/* Header du modal */}
            {(title || !hideCloseButton) && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                )}
                {!hideCloseButton && (
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-peach-500"
                    onClick={onClose}
                    aria-label="Fermer"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}
            
            {/* Contenu du modal */}
            <div className="p-6 flex-grow overflow-y-auto">{children}</div>
            
            {/* Footer du modal (optionnel) */}
            {footer && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Modal;
