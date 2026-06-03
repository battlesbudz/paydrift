import { Link } from 'react-router-dom'
import { 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users,
  CheckCircle,
  ArrowRight,
  Mail,
  Calendar,
  BarChart3,
  Star
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#5B6AF0] rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PayDrift</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-[#5B6AF0] hover:bg-[#3D4FD1] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-[#F8F9FF] to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#5B6AF0]/10 text-[#5B6AF0] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Automate Your Invoice Reminders
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Get Paid Faster with
                <span className="text-[#5B6AF0]"> Smart Reminders</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                PayDrift automatically chases your overdue invoices so you can focus on growing your business. 
                No more awkward follow-ups. No more lost revenue.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-2 bg-[#5B6AF0] hover:bg-[#3D4FD1] text-white px-8 py-4 rounded-xl font-medium text-lg transition-all hover:shadow-lg hover:shadow-[#5B6AF0]/25"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a 
                  href="#how-it-works" 
                  className="inline-flex items-center gap-2 border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-medium text-lg transition-colors"
                >
                  See How It Works
                </a>
              </div>
              <div className="flex items-center gap-8 mt-10">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B6AF0] to-[#8B9AFF] border-2 border-white" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Trusted by 2,000+ businesses</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Received</p>
                    <p className="text-2xl font-bold text-gray-900">$4,500.00</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#F8F9FF] rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[#5B6AF0]" />
                      <span className="font-medium text-gray-700">Invoice #1234</span>
                    </div>
                    <span className="text-green-600 font-medium">Paid</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#F8F9FF] rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[#FBBF24]" />
                      <span className="font-medium text-gray-700">Invoice #1235</span>
                    </div>
                    <span className="text-[#FBBF24] font-medium">Pending</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#F8F9FF] rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-red-500" />
                      <span className="font-medium text-gray-700">Invoice #1236</span>
                    </div>
                    <span className="text-red-500 font-medium">Overdue</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5B6AF0]/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[#5B6AF0]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Collection Rate</p>
                    <p className="text-lg font-bold text-gray-900">94.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Get Paid
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features that automate your accounts receivable and help you maintain healthy cash flow
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Mail,
                title: 'Smart Email Sequences',
                description: 'Automated, personalized reminders that feel human. Choose from multiple templates or create your own.'
              },
              {
                icon: Calendar,
                title: 'Flexible Scheduling',
                description: 'Set your reminder cadence exactly how you want it. Daily, weekly, or bi-weekly follow-ups.'
              },
              {
                icon: Users,
                title: 'Client Management',
                description: 'Organize all your clients in one place. Track payment history and communication logs.'
              },
              {
                icon: BarChart3,
                title: 'Real-time Analytics',
                description: 'See your collection rate, average payment time, and revenue recovered at a glance.'
              },
              {
                icon: Shield,
                title: 'Professional Branding',
                description: 'Your reminders look like they came from you. Custom email templates with your branding.'
              },
              {
                icon: Zap,
                title: 'Instant Notifications',
                description: 'Get notified immediately when an invoice is viewed, paid, or becomes overdue.'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-[#5B6AF0]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#5B6AF0] transition-colors">
                  <feature.icon className="w-7 h-7 text-[#5B6AF0] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-[#F8F9FF]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to start collecting your payments automatically
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Add Your Clients',
                description: 'Import your existing clients or add new ones. We\'ll help you organize everything.'
              },
              {
                step: '02',
                title: 'Create Your Invoices',
                description: 'Add your outstanding invoices with amounts and due dates. Categorize them however you like.'
              },
              {
                step: '03',
                title: 'Automate Reminders',
                description: 'Set your reminder schedule and let PayDrift handle the rest. Sit back and watch the payments come in.'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
                  <div className="text-6xl font-bold text-[#5B6AF0]/10 mb-4">{item.step}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-[#5B6AF0]/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your business. Start free and upgrade as you grow.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-[#5B6AF0] transition-colors">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Perfect for freelancers just starting out</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Up to 5 clients', '10 invoices/month', 'Basic email templates', 'Manual reminders'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link 
                to="/register" 
                className="block w-full text-center border-2 border-gray-200 hover:border-[#5B6AF0] text-gray-700 hover:text-[#5B6AF0] px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative bg-white p-8 rounded-2xl border-2 border-[#5B6AF0] shadow-xl shadow-[#5B6AF0]/10">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#5B6AF0] text-white text-sm font-medium px-4 py-1 rounded-full">Most Popular</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
              <p className="text-gray-600 mb-6">For growing businesses with more clients</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$19</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Unlimited clients', 'Unlimited invoices', 'Smart email sequences', 'Custom branding', 'Analytics dashboard', 'Priority support'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link 
                to="/register?plan=pro" 
                className="block w-full text-center bg-[#5B6AF0] hover:bg-[#3D4FD1] text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Start Pro Trial
              </Link>
            </div>

            {/* Agency Plan */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-[#5B6AF0] transition-colors">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Agency</h3>
              <p className="text-gray-600 mb-6">For agencies managing multiple clients</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$49</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Everything in Pro', 'White-label option', 'API access', 'Team collaboration', 'Dedicated account manager', 'Custom integrations'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link 
                to="/register?plan=agency" 
                className="block w-full text-center border-2 border-gray-200 hover:border-[#5B6AF0] text-gray-700 hover:text-[#5B6AF0] px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-[#5B6AF0] to-[#8B9AFF]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Stop Chasing Payments?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of businesses that use PayDrift to get paid faster and stress less.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 bg-white text-[#5B6AF0] px-8 py-4 rounded-xl font-medium text-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#5B6AF0] rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">PayDrift</span>
              </div>
              <p className="text-gray-500 mb-4">
                The smart way to get paid. Automate your invoice reminders and maintain healthy cash flow.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2026 PayDrift. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}