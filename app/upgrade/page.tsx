// app/upgrade/page.tsx - VERCEL STYLE
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { 
  Check, 
  Sparkles, 
  Zap, 
  Crown, 
  ArrowRight, 
  ArrowLeft, 
  Mail, 
  CreditCard,
  Shield,
  Clock,
  Users,
  Cpu,
  BarChart,
  Globe,
  MessageCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UpgradePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [selectedPlan, setSelectedPlan] = useState('pro');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          plan_type: planId,
          credits: planId === 'pro' ? 100 : 1000
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      alert(`Successfully upgraded to ${planId.toUpperCase()} plan!`);
      setCurrentPlan(planId);
      router.push('/');
      
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Upgrade failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const plans = [
    {
      id: 'free',
      name: t('upgrade.free') || 'Free',
      price: '0',
      period: t('upgrade.forever') || 'forever',
      credits: 5,
      features: [
        t('upgrade.features.free.credits') || '5 free credits monthly',
        t('upgrade.features.free.generation') || 'Basic image generation',
        t('upgrade.features.free.resolution') || 'Standard resolution',
        t('upgrade.features.free.support') || 'Community support',
        t('upgrade.features.free.retention') || '7-day history retention'
      ],
      buttonText: 'Current Plan',
      popular: false,
      icon: Sparkles,
      color: 'from-gray-400 to-gray-600'
    },
    {
      id: 'pro',
      name: t('upgrade.pro') || 'Pro',
      price: '19',
      period: t('upgrade.perMonth') || 'per month',
      credits: 100,
      features: [
        t('upgrade.features.pro.credits') || '100 credits monthly',
        t('upgrade.features.pro.generation') || 'HD image generation',
        t('upgrade.features.pro.video') || 'Video generation',
        t('upgrade.features.pro.support') || 'Priority support',
        t('upgrade.features.pro.retention') || '30-day history retention',
        t('upgrade.features.pro.batch') || 'Batch processing',
        t('upgrade.features.pro.api') || 'API access'
      ],
      buttonText: t('upgrade.upgradeNow') || 'Upgrade Now',
      popular: true,
      icon: Zap,
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'enterprise',
      name: t('upgrade.enterprise') || 'Enterprise',
      price: '99',
      period: t('upgrade.perMonth') || 'per month',
      credits: 1000,
      features: [
        t('upgrade.features.enterprise.credits') || '1000 credits monthly',
        t('upgrade.features.enterprise.generation') || '4K image generation',
        t('upgrade.features.enterprise.video') || 'Unlimited video generation',
        t('upgrade.features.enterprise.support') || '24/7 dedicated support',
        t('upgrade.features.enterprise.history') || 'Unlimited history',
        t('upgrade.features.enterprise.models') || 'Custom AI models',
        t('upgrade.features.enterprise.whiteLabel') || 'White-label solution',
        t('upgrade.features.enterprise.team') || 'Team management'
      ],
      buttonText: t('upgrade.contactSales') || 'Contact Sales',
      popular: false,
      icon: Crown,
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const faqItems = [
    {
      q: t('upgrade.faq.credits.question') || 'What happens to my unused credits?',
      a: t('upgrade.faq.credits.answer') || 'Unused credits roll over to the next month for Pro and Enterprise plans. Free plan credits reset monthly.'
    },
    {
      q: t('upgrade.faq.cancel.question') || 'Can I cancel anytime?',
      a: t('upgrade.faq.cancel.answer') || 'Yes! You can cancel your subscription anytime.'
    },
    {
      q: t('upgrade.faq.refunds.question') || 'Do you offer refunds?',
      a: t('upgrade.faq.refunds.answer') || 'We offer a 14-day money-back guarantee for all paid plans.'
    },
    {
      q: t('upgrade.faq.change.question') || 'Can I upgrade/downgrade my plan?',
      a: t('upgrade.faq.change.answer') || 'Yes, you can change your plan at any time.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500"></div>
                <span className="font-bold text-gray-900">Vogue AI</span>
              </Link>
            </div>
            
            <Link
              href="/"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Studio
            </Link>
          </div>
        </div>
      </nav>

      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 mb-6">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('upgrade.title') || 'Upgrade Your Plan'}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('upgrade.subtitle') || 'Unlock more credits, faster generation, and advanced features'}
            </p>
          </div>

          {/* Current Plan Status */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">{t('upgrade.current') || 'Current Plan'}</p>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {currentPlan.toUpperCase()}
                  </div>
                  {currentPlan === 'free' && (
                    <span className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium">
                      {t('upgrade.freeTier') || 'Free Tier'}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-600 mb-2">Available Credits</p>
                <div className="flex items-center justify-center md:justify-end gap-2">
                  <div className="text-2xl font-bold text-gray-900">5</div>
                  <div className="text-gray-500">/ 5</div>
                </div>
                <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = plan.id === currentPlan;
              
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border ${
                    plan.popular
                      ? 'border-blue-300 bg-white shadow-lg'
                      : 'border-gray-200 bg-white'
                  } ${isCurrent ? 'ring-2 ring-blue-500' : ''} p-6`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full">
                        {t('upgrade.mostPopular') || 'MOST POPULAR'}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-500 ml-2 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {plan.credits} credits included
                    </p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90'
                        : isCurrent
                        ? 'bg-gray-100 text-gray-500 cursor-default'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : plan.buttonText}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Features Comparison */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Compare Features</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Features</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-900">Free</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-900">Pro</th>
                    <th className="px6 py-3 text-center text-sm font-medium text-gray-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    ['AI Try-Ons', '✓', '✓', '✓'],
                    ['HD Resolution', 'Basic', '✓', '✓'],
                    ['Video Generation', '✗', '✓', '✓'],
                    ['API Access', '✗', '✓', '✓'],
                    ['Priority Support', '✗', '✓', '✓'],
                    ['Team Management', '✗', '✗', '✓']
                  ].map(([feature, free, pro, enterprise], index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{feature}</td>
                      <td className="px-6 py-4 text-center text-sm">
                        <span className={free === '✓' ? 'text-green-600' : free === 'Basic' ? 'text-blue-600' : 'text-gray-400'}>
                          {free}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <span className={pro === '✓' ? 'text-green-600' : 'text-gray-400'}>{pro}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <span className={enterprise === '✓' ? 'text-green-600' : 'text-gray-400'}>{enterprise}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              {t('upgrade.faq.title') || 'Frequently Asked Questions'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <h3 className="font-medium text-gray-900">{item.q}</h3>
                  </div>
                  <p className="text-gray-600 text-sm pl-8">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 mb-4">
              <MessageCircle className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('upgrade.needHelp') || 'Need help choosing a plan?'}
            </h3>
            <p className="text-gray-600 mb-6">
              Our team is here to help you find the perfect plan for your needs.
            </p>
            <a
              href="mailto:support@vogueai.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              <Mail className="w-4 h-4" />
              {t('upgrade.contactSupport') || 'Contact Support Team'}
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500"></div>
              <div>
                <p className="text-gray-900 font-medium">Vogue AI Studio</p>
                <p className="text-sm text-gray-500">Redefining virtual fashion experiences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Powered by Fal AI • Secure payments with Stripe • Hosted on Vercel
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}