import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Supporter = () => {
  const { isSupporter, loading } = useSubscription();
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isSupporter) {
      navigate(`/${language}/pricing`);
    }
  }, [isSupporter, loading, navigate, language]);

  useEffect(() => {
    // Load the supporter ad script
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSupporter) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <Card className="p-8 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            🎉 Supporter Bereich
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Willkommen im exklusiven Supporter-Bereich! Danke, dass du Bread unterstützt.
          </p>
          
          <div className="space-y-6">
            <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h2 className="text-2xl font-semibold mb-3">✨ Deine Vorteile</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Unbegrenzte BreadGPT Nutzung ohne Wartezeit</li>
                <li>• Unbegrenzte Blog-Websites erstellen</li>
                <li>• Deine Posts werden weiter oben angezeigt</li>
                <li>• Feature-Anfragen stellen</li>
                <li>• Neue Features zuerst erhalten</li>
                <li>• Exklusive Features nur für Supporter</li>
                <li>• Supporter-Badge in deinem Profil</li>
              </ul>
            </div>

            <div className="p-6 bg-secondary/5 rounded-lg border border-secondary/20">
              <h2 className="text-2xl font-semibold mb-3">🚀 Bald verfügbar</h2>
              <p className="text-muted-foreground">
                Weitere exklusive Features für Supporter sind bereits in Arbeit.
                Bleib dran für Updates!
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Supporter;
