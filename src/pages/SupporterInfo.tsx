import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const SupporterInfo = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const text = {
    de: {
      title: '✨ Werde Supporter',
      subtitle: 'Unterstütze Bread und erhalte exklusive Vorteile',
      benefits: 'Deine Supporter-Vorteile',
      benefitsList: [
        'Unbegrenzte BreadGPT Nutzung ohne Wartezeit',
        'Unbegrenzte Blog-Websites erstellen',
        'Deine Posts werden weiter oben angezeigt',
        'Feature-Anfragen stellen',
        'Neue Features zuerst erhalten',
        'Exklusive Features nur für Supporter',
        'Supporter-Badge in deinem Profil',
        'Zugang zum exklusiven Supporter-Bereich'
      ],
      howItWorks: 'Wie funktioniert es?',
      howItWorksText: 'Der Supporter-Plan ist komplett kostenlos! Du unterstützt Bread durch das Anzeigen von Werbung. Du kannst jederzeit in den Einstellungen entscheiden, ob du Werbung sehen möchtest oder nicht.',
      cta: 'Jetzt Supporter werden',
      login: 'Bereits Supporter? Login'
    },
    en: {
      title: '✨ Become a Supporter',
      subtitle: 'Support Bread and get exclusive benefits',
      benefits: 'Your Supporter Benefits',
      benefitsList: [
        'Unlimited BreadGPT usage without cooldown',
        'Create unlimited blog websites',
        'Your posts are displayed higher up',
        'Request new features',
        'Get new features first',
        'Exclusive features only for supporters',
        'Supporter badge on your profile',
        'Access to exclusive supporter area'
      ],
      howItWorks: 'How does it work?',
      howItWorksText: 'The Supporter plan is completely free! You support Bread by viewing ads. You can always decide in the settings whether you want to see ads or not.',
      cta: 'Become a Supporter Now',
      login: 'Already a Supporter? Login'
    }
  };

  const t = text[language];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-xl text-muted-foreground">{t.subtitle}</p>
          </div>

          <Card className="p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">{t.benefits}</h2>
            <div className="space-y-3">
              {t.benefitsList.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 mb-8 bg-primary/5 border-primary/20">
            <h2 className="text-2xl font-bold mb-4">{t.howItWorks}</h2>
            <p className="text-lg text-muted-foreground">{t.howItWorksText}</p>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate(`/${language}/pricing`)}
              className="text-lg px-8"
            >
              {t.cta}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/supporter-login')}
              className="text-lg px-8"
            >
              {t.login}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupporterInfo;
