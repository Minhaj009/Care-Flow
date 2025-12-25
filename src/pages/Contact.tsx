import { MessageSquare, Building2 } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="bg-white">
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Partner With Us
            </h1>
            <p className="text-xl text-slate-600">
              Whether you're a clinic or an investor, we're here to help
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border-2 border-green-200 p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">For Doctors</h2>
              <p className="text-lg text-slate-700 mb-6">Need Help?</p>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Message us on WhatsApp. We reply in 5 minutes.
              </p>
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                Chat with Support
              </a>
              <div className="mt-8 pt-6 border-t border-green-200">
                <p className="text-sm text-slate-500">
                  Available 9 AM - 9 PM PKT, 7 days a week
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-200 p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">For Investors</h2>
              <p className="text-lg text-slate-700 mb-6">Soft Hive Inc. (USA)</p>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Interested in Data Licensing, APIs, or Investor Relations?
              </p>
              <a
                href="mailto:hello@softhive.com"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Contact Delaware HQ
              </a>
              <div className="mt-8 pt-6 border-t border-blue-200">
                <p className="text-sm text-slate-500">
                  Enterprise inquiries: partnerships@softhive.com
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-slate-50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Looking for Something Else?
            </h3>
            <p className="text-slate-600 mb-6">
              General inquiries, press, or partnerships
            </p>
            <a
              href="mailto:hello@softhive.com"
              className="inline-block px-6 py-2 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-slate-400 hover:bg-white transition-all"
            >
              hello@softhive.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
