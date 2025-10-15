import React, { useEffect } from 'react';

const AdBanner: React.FC = () => {
  useEffect(() => {
    // Load the ad script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.setAttribute('data-cfasync', 'false');
    script.innerHTML = `
/*<![CDATA[/* */
(function(){var w=window,b="ce0ffd695e128971d4eb5d7083bf32c0",d=[["siteId",21-380-197+5247522],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","auto"]],f=["d3d3LnZpc2FyaW9tZWRpYS5jb20vZW5hbm9iYXIubWluLmNzcw==","ZDEzazdwcmF4MXlpMDQuY2xvdWRmcm9udC5uZXQvbXVsbE93L3F0dXJuLm1pbi5qcw=="],s=-1,a,g,y=function(){clearTimeout(g);s++;if(f[s]&&!(1786472059000<(new Date).getTime()&&1<s)){a=w.document.createElement("script");a.type="text/javascript";a.async=!0;var l=w.document.getElementsByTagName("script")[0];a.src="https://"+atob(f[s]);a.crossOrigin="anonymous";a.onerror=y;a.onload=function(){clearTimeout(g);w[b.slice(0,16)+b.slice(0,16)]||y()};g=setTimeout(y,5E3);l.parentNode.insertBefore(a,l)}};if(!w[b]){try{Object.freeze(w[b]=d)}catch(e){}y()}})();
/*]]>/* */
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};

export default AdBanner;
