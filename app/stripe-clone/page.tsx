import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"

export default function StripeClone() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b9d] via-[#ffa06b] via-[#ffd96b] to-[#c96bff] opacity-90" />

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm text-white border border-white/30">
                <span className="font-medium">Stripe Atlas</span>
                <span className="opacity-80">Start a company</span>
              </div>

              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                Financial infrastructure to grow your revenue
              </h1>

              <p className="text-xl text-gray-800 max-w-xl leading-relaxed">
                Join the millions of companies that use Stripe to accept payments online and in person, embed financial
                services, power custom revenue models, and build a more profitable business.
              </p>

              {/* Email Signup Form */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 h-12 bg-white border-gray-300 text-base"
                />
                <Button className="h-12 px-6 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-full">
                  Start now
                </Button>
              </div>
            </div>

            {/* Right Column - Dashboard Mockup */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#635bff] to-[#8b7fff] rounded-lg flex items-center justify-center">
                      <div className="text-white font-bold text-xl">F</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Furever</div>
                      <div className="text-xs text-gray-500">furever.com</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                  </div>
                </div>

                {/* Today Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Today</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Net volume</div>
                      <div className="text-2xl font-bold text-gray-900">$3,242,343.52</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Yesterday</div>
                      <div className="text-2xl font-bold text-gray-900">$2,872,038.29</div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg relative overflow-hidden">
                    <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                      <path
                        d="M 0,80 Q 50,60 100,70 T 200,50 T 300,40 T 400,30"
                        fill="none"
                        stroke="#635bff"
                        strokeWidth="2"
                        opacity="0.6"
                      />
                      <path
                        d="M 0,90 Q 50,85 100,80 T 200,75 T 300,65 T 400,60"
                        fill="none"
                        stroke="#00d4ff"
                        strokeWidth="2"
                        opacity="0.6"
                      />
                    </svg>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Gross volume</div>
                    <div className="text-lg font-semibold text-gray-900">$102,483,827</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">MRR Balance</div>
                    <div className="text-lg font-semibold text-gray-900">$943,071.91</div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-900 mb-2">Payment methods</div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-4 bg-blue-500 rounded" />
                      <span className="text-sm text-gray-700">Card</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">$422,000</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-4 bg-green-500 rounded" />
                      <span className="text-sm text-gray-700">Bank</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">$267,000</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-4 bg-purple-500 rounded" />
                      <span className="text-sm text-gray-700">Paid out</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">$422,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos Section */}
      <section className="py-16 bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center justify-items-center opacity-60">
            <div className="text-2xl font-bold text-gray-900">OpenAI</div>
            <div className="text-2xl font-bold text-gray-900">amazon</div>
            <div className="text-2xl font-bold text-gray-900">Google</div>
            <div className="text-2xl font-bold text-gray-900">ANTHROPIC</div>
            <div className="text-2xl font-bold text-red-600">M</div>
            <div className="text-2xl font-bold text-green-600">shopify</div>
            <div className="text-2xl font-bold text-red-500">airbnb</div>
            <div className="text-2xl font-bold text-gray-900">NBA</div>
          </div>
        </div>
      </section>

      {/* Modular Solutions Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="text-sm font-semibold text-[#635bff] uppercase tracking-wide">Modular solutions</div>
              <h2 className="text-5xl font-bold text-gray-900 leading-tight">
                A fully integrated suite of financial and payments products
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Reduce costs, grow revenue, and run your business more efficiently on a fully integrated platform. Use
                Stripe to handle all of your payments-related needs, manage revenue operations, and launch (or invent)
                new business models.
              </p>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="space-y-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-xl">
                    <span className="text-3xl">🪑</span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-2">Wood Chair (4x)</div>
                    <div className="text-3xl font-bold text-gray-900 mb-4">$16</div>
                  </div>
                  <Button className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg">
                    Buy
                  </Button>
                  <Button className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg">
                    Buy with GPay
                  </Button>
                  <div className="text-center text-sm text-gray-500">or pay with card</div>
                  <div className="space-y-3">
                    <Input placeholder="Email" className="h-10" />
                    <Input placeholder="Card information" className="h-10" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="MM / YY" className="h-10" />
                      <Input placeholder="CVC" className="h-10" />
                    </div>
                    <Input placeholder="Cardholder name" className="h-10" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="United States" className="h-10" />
                      <Input placeholder="ZIP" className="h-10" />
                    </div>
                  </div>
                  <Button className="w-full h-12 bg-[#635bff] hover:bg-[#5449d4] text-white font-medium rounded-lg">
                    Pay $16
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payments Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-[#635bff] rounded" />
              <span className="text-sm font-semibold text-gray-900">Payments</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Accept and optimize payments, globally</h2>
            <p className="text-lg text-gray-600 mb-8">
              Increase authorization rates, offer local payment methods to boost conversion, and reduce fraud using AI.
            </p>
            <Button className="h-12 px-6 bg-[#635bff] hover:bg-[#5449d4] text-white font-medium rounded-full">
              Start with Payments
            </Button>

            <div className="mt-12 space-y-4">
              <div className="text-sm font-semibold text-gray-900">See also</div>
              <div className="space-y-2">
                <a href="#" className="block text-[#635bff] hover:underline">
                  Try our automating tax registration, collection, and filing
                </a>
                <a href="#" className="block text-[#635bff] hover:underline">
                  Radar for AI-powered fraud protection
                </a>
                <a href="#" className="block text-[#635bff] hover:underline">
                  Terminal for custom in-person payments
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Billing Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-green-500 rounded" />
              <span className="text-sm font-semibold text-gray-900">Billing</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Capture recurring revenue</h2>
            <p className="text-lg text-gray-600 mb-8">
              Manage flat rate, usage-based, and hybrid pricing models, minimize churn, and automate finance operations.
            </p>
            <Button className="h-12 px-6 bg-[#635bff] hover:bg-[#5449d4] text-white font-medium rounded-full">
              Explore Billing
            </Button>

            <div className="mt-12 space-y-4">
              <div className="text-sm font-semibold text-gray-900">See also</div>
              <div className="space-y-2">
                <a href="#" className="block text-[#635bff] hover:underline">
                  Invoicing for finance creation, collection, and tracking
                </a>
                <a href="#" className="block text-[#635bff] hover:underline">
                  Usage-based billing for metering, billing, and consumption insights
                </a>
                <a href="#" className="block text-[#635bff] hover:underline">
                  Sigma for custom revenue reports on SQL-like interface
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
