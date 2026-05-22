import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTracking } from '../../contexts/TrackingContext';

const PageViewTracker: React.FC = () => {
  const location = useLocation();
  const { trackPageView, loading } = useTracking();

  useEffect(() => {
    if (!loading) {
      trackPageView(location.pathname + location.search);
    }
  }, [location.pathname, location.search, loading, trackPageView]);

  return null;
};

export default PageViewTracker;
