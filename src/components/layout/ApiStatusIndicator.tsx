/**
 * @fileoverview A component that displays the status of the BOAMP API connection.
 */

import { useApiStatus } from "../../hooks/useApiStatus";
import { ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';

export const ApiStatusIndicator = () => {
  const { isSuccess, isLoading, isError } = useApiStatus();

  if (isLoading) {
    return (
      <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Vérification de l'API...
      </div>
    );
  }

  const statusClass = isSuccess
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';
  
  const dotClass = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const Icon = isSuccess ? ShieldCheck : AlertTriangle;
  const text = isSuccess ? 'API BOAMP connectée' : 'Erreur de connexion API';

  return (
    <div className="mt-4">
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}
        role="status"
      >
        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${dotClass}`}></div>
        <Icon className="h-4 w-4 mr-1.5" />
        {text}
      </div>
    </div>
  );
};
