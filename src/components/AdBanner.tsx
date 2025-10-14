import React, { useEffect, useRef } from 'react';

const AdBanner: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adRef.current) {
      const script = document.createElement('script');
      script.src = '//data527.click/js/responsive.js';
      script.async = true;
      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div ref={adRef}>
      <ins
        style={{ width: '0px', height: '0px' }}
        data-width="0"
        data-height="0"
        className="s5b71899074"
        data-domain="//data527.click"
        data-affquery="/c9e671ef99da8d326022/5b71899074/?placementName=bread_blog"
      />
    </div>
  );
};

export default AdBanner;
