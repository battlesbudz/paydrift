import { Link } from 'react-router-dom';
import { DollarSign, Clock, Send } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#5B6AF0] rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PayDrift</span>
          </div>
          <Link
            to="/register"
            className="px-4 py-2 bg-[#5B6AF0] text-white rounded-lg font-medium hover:bg-[#4A5ADF] transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in">
            Stop chasing.
            <br />
            <span className="text-[#5B6AF0]">Start getting paid.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            PayDrift sends friendly payment reminders to your clients so you can focus on
            what matters. No awkward follow-ups. Just consistent, professional billing.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#5B6AF0] text-white rounded-xl font-medium text-lg hover:bg-[#4A5ADF] transition-all hover:scale-105"
          >
            Start free today
            <Send className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to get paid
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-[#5B6AF0]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Auto reminders</h3>
              <p className="text-gray-600">
                Set it and forget it. PayDrift automatically sends payment reminders at
                the right intervals to maximize your collection rate.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Send className="w-6 h-6 text-[#5B6AF0]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Friendly emails</h3>
              <p className="text-gray-600">
                Professional, human-sounding reminders that get opened. No aggressive
                collection tactics, just courteous nudges.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="w-6 h-6 text-[#5B6AF0]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get paid faster</h3>
              <p className="text-gray-600">
                Clients pay faster with clear invoices and timely reminders. Track
                everything from a single dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, no surprises.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="text-gray-600">1 client</li>
                <li className="text-gray-600">5 invoices</li>
                <li className="text-gray-600">Basic reminders</li>
              </ul>
              <Link
                to="/register"
                className="block text-center py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Get started
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-white rounded-xl p-8 border-2 border-[#5B6AF0] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#5B6AF0] text-white text-sm font-medium rounded-full">
                Popular
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$19</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="text-gray-600">25 clients</li>
                <li className="text-gray-600">Unlimited invoices</li>
                <li className="text-gray-600">Priority support</li>
                <li className="text-gray-600">Custom reminders</li>
              </ul>
              <Link
                to="/register"
                className="block text-center py-3 px-6 bg-[#5B6AF0] text-white rounded-lg font-medium hover:bg-[#4A5ADF] transition-colors"
              >
                Start Pro trial
              </Link>
            </div>
            {/* Agency */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Agency</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$49</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="text-gray-600">Unlimited clients</li>
                <li className="text-gray-600">Unlimited invoices</li>
                <li className="text-gray-600">White-label emails</li>
                <li className="text-gray-600">API access</li>
              </ul>
              <Link
                to="/register"
                className="block text-center py-3 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Start Agency trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#5B6AF0] rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PayDrift</span>
          </div>
          <p className="text-gray-400 text-sm">
            Made for freelancers and agencies who hate chasing payments.
          </p>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}