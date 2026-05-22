import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, BarChart3, Check, Star } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Section héros */}
      <div className="bg-gradient-to-r from-peach-50 to-peach-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Trouvez des Marchés Publics</span>
                <span className="block text-peach-600">Recevez des Alertes. Gagnez des Marchés.</span>
              </h1>
              <p className="mt-6 text-xl text-gray-700">
                AOMaster aide les professionnels à découvrir et suivre les marchés publics du BOAMP (France) et du TED (UE) en une seule interface.
              </p>
              <div className="mt-8 flex space-x-4">
                <button 
                  onClick={() => navigate('/search')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-peach-600 hover:bg-peach-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500 transition-colors duration-200"
                >
                  <Search className="mr-2" size={20} />
                  Commencer la recherche
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-peach-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500 transition-colors duration-200"
                >
                  Créer un compte gratuit
                </button>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-8 sm:p-10">
                  <div className="flex items-center justify-center h-64">
                    <img
                      src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800" 
                      alt="Professionnels examinant des contrats"
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section fonctionnalités */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Simplifiez votre veille des marchés publics
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Notre plateforme vous aide à trouver et suivre les marchés publics en toute simplicité.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-peach-500 rounded-md shadow-lg">
                        <Search className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Recherche avancée</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Trouvez les opportunités pertinentes grâce à des filtres puissants incluant mots-clés, codes CPV, montants et plus encore.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-peach-500 rounded-md shadow-lg">
                        <Bell className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Alertes personnalisées</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Recevez des notifications lorsque de nouveaux marchés correspondant à vos critères sont publiés.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-peach-500 rounded-md shadow-lg">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Analyse du marché</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Obtenez des insights précieux sur les tendances des marchés publics dans votre secteur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section plans tarifaires */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Choisissez le plan qui vous convient
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Des solutions adaptées à tous les professionnels, de l'entrepreneur individuel aux grandes entreprises.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Plan Gratuit */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-900">Découverte</h3>
                  <p className="mt-4 text-gray-500">Parfait pour commencer</p>
                  <div className="mt-6">
                    <span className="text-4xl font-extrabold text-gray-900">0€</span>
                    <span className="text-base font-medium text-gray-500">/mois</span>
                  </div>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">50 recherches/mois</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">3 alertes actives</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">Historique 30 jours</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">Support communautaire</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Commencer gratuitement
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Pro */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-peach-500 relative">
              <div className="absolute top-0 right-0 bg-peach-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                <Star className="inline h-4 w-4 mr-1" />
                Populaire
              </div>
              <div className="px-6 py-8">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-900">Croissance</h3>
                  <p className="mt-4 text-gray-500">Pour les professionnels actifs</p>
                  <div className="mt-6">
                    <span className="text-4xl font-extrabold text-gray-900">49€</span>
                    <span className="text-base font-medium text-gray-500">/mois HT</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">588€/an</p>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">Recherches illimitées</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">Alertes illimitées</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">Historique complet</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">Analyse concurrentielle</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">Export CSV/PDF</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">Support prioritaire</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-peach-600 hover:bg-peach-700 transition-colors duration-200"
                  >
                    Choisir Pro
                  </button>
                </div>
              </div>
            </div>

            {/* Plan Enterprise */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-900">Sur mesure</h3>
                  <p className="mt-4 text-gray-500">Pour les grandes organisations</p>
                  <div className="mt-6">
                    <span className="text-2xl font-extrabold text-gray-900">Sur devis</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">À partir de 200€/mois</p>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">Multi-utilisateurs</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">Accès API</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">Intégrations CRM</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">Formation personnalisée</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                    <span className="ml-3 text-sm text-gray-700">SLA garanti</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Nous contacter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section statistiques */}
      <div className="bg-peach-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              La référence des professionnels en Europe
            </h2>
            <p className="mt-3 text-xl text-gray-500 sm:mt-4">
              Rejoignez les milliers de professionnels qui utilisent notre plateforme pour trouver et remporter des marchés publics.
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                Marchés
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-peach-600">
                100K+
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                Utilisateurs
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-peach-600">
                5 000+
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                Sources
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-peach-600">
                2
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Section CTA */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="bg-peach-600 rounded-lg shadow-xl overflow-hidden lg:grid lg:grid-cols-2 lg:gap-4">
            <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Prêt à commencer ?</span>
                  <span className="block">Créez votre compte gratuit aujourd'hui.</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-peach-200">
                  Rejoignez les milliers de professionnels qui utilisent AOMaster pour trouver et gagner des marchés publics. Pas de carte bancaire requise.
                </p>
                <div className="mt-8">
                  <div className="inline-flex rounded-md shadow">
                    <button
                      onClick={() => navigate('/signup')}
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-peach-600 bg-white hover:bg-peach-50 transition-colors duration-200"
                    >
                      S'inscrire gratuitement
                    </button>
                  </div>
                  <div className="mt-3 inline-flex rounded-md shadow ml-4">
                    <button
                      onClick={() => navigate('/search')}
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-peach-800 hover:bg-peach-900 transition-colors duration-200"
                    >
                      Essayer la recherche
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="-mt-6 aspect-w-5 aspect-h-3 md:aspect-w-2 md:aspect-h-1">
              <img
                className="transform translate-x-6 translate-y-6 rounded-md object-cover object-left-top sm:translate-x-16 lg:translate-y-20"
                src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Capture d'écran de l'application"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;