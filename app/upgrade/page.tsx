// app/upgrade/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Zap, Crown, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    period: 'forever',
    credits: 5,
    features: [
      '5 free credits monthly',
      'Basic image generation',
      'Standard resolution',
      'Community support',
      '7-day history retention'
    ],
    buttonText: 'Current Plan',
    popular: false,
    icon: Sparkles
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '19',
    period: 'per month',
    credits: 100,
    features: [
      '100 credits monthly',
      'HD image generation',
      'Video generation',
      'Priority support',
      '30-day history retention',
      'Batch processing',
      'API access'
    ],
    buttonText: 'Upgrade to Pro',
    popular: true,
    icon: Zap
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '99',
    period: 'per month',
    credits: 1000,
    features: [
      '1000 credits monthly',
      '4K image generation',
      'Unlimited video generation',
      '24/7 dedicated support',
      'Unlimited history',
      'Custom AI models',
      'White-label solution',
      'Team management'
    ],
    buttonText: 'Contact Sales',
    popular: false,
    icon: Crown
  }
];

export default function UpgradePage() {
  const router = useRouter();
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
    
    // In a real app, you would integrate with Stripe here
    // For now, we'll simulate the upgrade
    
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading upgrade plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Virtual Try-On Studio</h1>
              <p className="text-sm text-gray-400">Upgrade your experience</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              ← Back to Studio
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
              Upgrade Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Creative Power</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Unlock more credits, faster generation, and advanced features
            </p>
          </div>

          {/* Current Plan Status */}
          <Card className="mb-12 p-6 bg-gradient-to-r from-gray-900 to-black">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-gray-400 mb-2">Current Plan</p>
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold">
                    {currentPlan.toUpperCase()}
                  </div>
                  {currentPlan === 'free' && (
                    <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                      Free Tier
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-gray-400 mb-2">Remaining Credits</p>
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
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="px-4 py-1 bg-blue-500 rounded-full text-sm font-semibold">
                        CURRENT PLAN
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
                      {plan.credits} credits included
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
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  q: 'What happens to my unused credits?',
                  a: 'Unused credits roll over to the next month for Pro and Enterprise plans. Free plan credits reset monthly.'
                },
                {
                  q: 'Can I cancel anytime?',
                  a: 'Yes! You can cancel your subscription anytime. You\'ll keep access until the end of your billing period.'
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'We offer a 14-day money-back guarantee for all paid plans if you\'re not satisfied.'
                },
                {
                  q: 'Can I upgrade/downgrade my plan?',
                  a: 'Yes, you can change your plan at any time. Changes take effect immediately.'
                }
              ].map((item, index) => (
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
              Need help choosing a plan?
            </p>
            <a
              href="mailto:support@tryonstudio.com"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
            >
              ✉️ Contact Support
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>Virtual Try-On Studio • Powered by Fal AI • Secure payments with Stripe</p>
          <p className="mt-2 text-sm">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}