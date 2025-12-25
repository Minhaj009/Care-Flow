import { Globe2, Target, Cpu } from 'lucide-react';

export const About = () => {
  return (
    <div className="bg-white">
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Built for the Global South.
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 leading-relaxed">
            We are Soft Hive. We are not just building apps; we are building the digital infrastructure for the next billion users.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Global Reach</h3>
              <p className="text-slate-600">
                Serving emerging markets across Asia, Africa, and Latin America
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Mission Driven</h3>
              <p className="text-slate-600">
                Making world-class software accessible to everyone
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Powered</h3>
              <p className="text-slate-600">
                Proprietary Data Engines trained on real-world complexity
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Mission</h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Western software doesn't work here. It's too expensive, too complex, and doesn't understand our chaos. We build tools that embrace the complexity of Emerging Markets.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              From clinics in Lahore to hospitals in Lagos, we're creating software that speaks your language, understands your workflow, and respects your reality.
            </p>
          </div>

          <div className="bg-blue-50 rounded-2xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">The Technology</h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              Powered by proprietary 'Data Engines' that turn the chaotic noise of the clinic into structured, life-saving insights.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              Our AI models are trained on the messy, beautiful reality of how healthcare actually works in emerging markets. Not sanitized, Western-centric data.
            </p>
          </div>

          <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 md:p-12 text-center">
            <blockquote className="text-2xl md:text-3xl font-bold text-white italic leading-relaxed">
              "The chaos of the Emerging Markets is the training ground for the next generation of resilient AI."
            </blockquote>
            <p className="text-blue-200 mt-6 text-lg">— Soft Hive Team</p>
          </div>
        </div>
      </section>
    </div>
  );
};
