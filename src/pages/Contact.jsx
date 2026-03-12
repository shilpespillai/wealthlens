import React from "react";
import { ArrowLeft, Mail, MessageCircle, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Calculator
        </a>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-8">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contact Us</h1>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed text-lg mb-8 font-medium">
              Have questions or feedback? We'd love to hear from you. Please reach out to our support team using the methods below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
                    <Mail className="w-8 h-8 text-indigo-500 mb-4" />
                    <h3 className="text-slate-900 font-bold mb-2">Email Support</h3>
                    <p className="text-sm text-slate-600">support@wealthlens.com</p>
                    <p className="text-xs text-slate-400 mt-2">Expect a reply within 24 hours</p>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
                    <MapPin className="w-8 h-8 text-indigo-500 mb-4" />
                    <h3 className="text-slate-900 font-bold mb-2">Office Location</h3>
                    <p className="text-sm text-slate-600">San Francisco, CA</p>
                    <p className="text-xs text-slate-400 mt-2">United States</p>
                </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-2xl mb-10">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h3>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Your Email</label>
                  <input type="email" id="email" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" placeholder="john@example.com" required />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input type="text" id="subject" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" placeholder="How can we help?" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea id="message" rows={5} className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-y" placeholder="Type your message here..." required></textarea>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm">
                  Send Message
                </button>
              </form>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-2xl text-center">
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Media & Partnerships</h3>
              <p className="text-sm text-indigo-700">
                For press inquiries or integration partnerships, please email <br/><a href="mailto:partners@wealthlens.com" className="font-bold underline text-indigo-600 hover:text-indigo-800">partners@wealthlens.com</a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
