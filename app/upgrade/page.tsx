// app/upgrade/page.tsx - DİL DESTEKLİ VERSİYON
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext'; // Dil hook'u eklendi

export default function UpgradePage() {
  const router = useRouter();
  const { t } = useLanguage(); // Dil fonksiyonu eklendi
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [selectedPlan, setSelectedPlan] = useState('pro');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Get current plan from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan_type')
          .eq('id', session.user.id)
          .single();
          
        if (profile?.plan_type) {
          setCurrentPlan(profile.plan_type);
          setSelectedPlan(profile.plan_type === 'free' ? 'pro' : profile.plan_type);
        }
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    };
    
    checkAuth();
  }, [router]);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user's plan in database
      const { error } = await supabase
        .from('profiles')
        .update({ 
          plan_type: planId,
          credits: planId === 'pro' ? 100 : 1000
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      alert(`${t('upgrade.success')} ${planId.toUpperCase()} ${t('upgrade.plan')}!`);
      setCurrentPlan(planId);
      router.push('/');
      
    } catch (error) {
      console.error('Upgrade error:', error);
      alert(t('upgrade.failed'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Plans data with translations
  const plans = [
    {
      id: 'free',
      name: t('upgrade.free'),
      price: '0',
      period: t('upgrade.forever'),
      credits: 5,
      features: [
        t('upgrade.features.free.credits'),
        t('upgrade.features.free.generation'),
        t('upgrade.features.free.resolution'),
        t('upgrade.features.free.support'),
        t('upgrade.features.free.retention')
      ],
      buttonText: t('upgrade.currentPlan'),
      popular: false,
      icon: Sparkles
    },
    {
      id: 'pro',
      name: t('upgrade.pro'),
      price: '19',
      period: t('upgrade.perMonth'),
      credits: 100,
      features: [
        t('upgrade.features.pro.credits'),
        t('upgrade.features.pro.generation'),
        t('upgrade.features.pro.video'),
        t('upgrade.features.pro.support'),
        t('upgrade.features.pro.retention'),
        t('upgrade.features.pro.batch'),
        t('upgrade.features.pro.api')
      ],
      buttonText: t('upgrade.upgradeNow'),
      popular: true,
      icon: Zap
    },
    {
      id: 'enterprise',
      name: t('upgrade.enterprise'),
      price: '99',
      period: t('upgrade.perMonth'),
      credits: 1000,
      features: [
        t('upgrade.features.enterprise.credits'),
        t('upgrade.features.enterprise.generation'),
        t('upgrade.features.enterprise.video'),
        t('upgrade.features.enterprise.support'),
        t('upgrade.features.enterprise.history'),
        t('upgrade.features.enterprise.models'),
        t('upgrade.features.enterprise.whiteLabel'),
        t('upgrade.features.enterprise.team')
      ],
      buttonText: t('upgrade.contactSales'),
      popular: false,
      icon: Crown
    }
  ];

  // FAQ data with translations
  const faqItems = [
    {
      q: t('upgrade.faq.credits.question'),
      a: t('upgrade.faq.credits.answer')
    },
    {
      q: t('upgrade.faq.cancel.question'),
      a: t('upgrade.faq.cancel.answer')
    },
    {
      q: t('upgrade.faq.refunds.question'),
      a: t('upgrade.faq.refunds.answer')
    },
    {
      q: t('upgrade.faq.change.question'),
      a: t('upgrade.faq.change.answer')
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{t('app.title')}</h1>
              <p className="text-sm text-gray-400">{t('upgrade.experience')}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('buttons.back')}
            </Button>
          </div>
        </div>
      </header>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('upgrade.title')} <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{t('upgrade.creativePower')}</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              {t('upgrade.subtitle')}
            </p>
          </div>

          {/* Current Plan Status */}
          <Card className="mb-12 p-6 bg-gradient-to-r from-gray-900 to-black">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-gray-400 mb-2">{t('upgrade.current')}</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold">
                    {currentPlan.toUpperCase()}
                  </div>
                  {currentPlan === 'free' && (
                    <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                      {t('upgrade.freeTier')}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-gray-400 mb-2">{t('stats.availableCredits')}</p>
                <div className="flex items-center justify-center md:justify-end gap-2">
                  <div className="text-3xl font-bold">5</div>
                  <div className="text-gray-400">/ 5</div>
                </div>
                <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = plan.id === currentPlan;
              
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-8 border-2 transition-all ${
                    plan.popular
                      ? 'border-purple-500 bg-gradient-to-b from-gray-900 to-black scale-105'
                      : 'border-white/10 bg-black'
                  } ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-semibold">
                        {t('upgrade.mostPopular')}
                      </div>
                    </div>
                  )}
                  
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="px-4 py-1 bg-blue-500 rounded-full text-sm font-semibold">
                        {t('upgrade.currentPlan')}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-3 rounded-lg ${
                      plan.popular ? 'bg-purple-500/20' : 'bg-white/10'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        plan.popular ? 'text-purple-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold">${plan.price}</span>
                      <span className="text-gray-400 ml-2">{plan.period}</span>
                    </div>
                    <p className="text-gray-400 mt-2">
                      {plan.credits} {t('upgrade.creditsIncluded')}
                    </p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || loading}
                    className={`w-full py-6 text-lg font-semibold ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90'
                        : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {isCurrent ? plan.buttonText : plan.buttonText}
                    {!isCurrent && <ArrowRight className="ml-2 w-5 h-5" />}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <Card className="p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">
              {t('upgrade.faq.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {faqItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="text-xl font-semibold">{item.q}</h3>
                  <p className="text-gray-400">{item.a}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Contact Support */}
          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">
              {t('upgrade.needHelp')}
            </p>
            <a
              href="mailto:support@tryonstudio.com"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t('upgrade.contactSupport')}
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>{t('upgrade.footer.poweredBy')}</p>
          <p className="mt-2 text-sm">
            © {new Date().getFullYear()} {t('upgrade.footer.rights')}
          </p>
        </div>
      </footer>
    </div>
  );
}
