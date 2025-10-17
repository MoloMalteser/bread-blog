import React, { useEffect } from 'react';

const AdBanner: React.FC = () => {
  useEffect(() => {
    // Create container div for ad
    const adContainer = document.createElement('div');
    adContainer.innerHTML = '<ins style="width: 0px;height:0px" data-width="0" data-height="0" class="s5b71899074" data-domain="//data527.click" data-affquery="/c9e671ef99da8d326022/5b71899074/?placementName=bread_blog"><script src="//data527.click/js/responsive.js" async></script></ins>';
    document.body.appendChild(adContainer);

    return () => {
      if (document.body.contains(adContainer)) {
        document.body.removeChild(adContainer);
      }
    };
  }, []);

  return null;
};

export default AdBanner;
