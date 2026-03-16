import React, { useState } from "react";
import { ArrowLeft, Mail, MessageCircle, MapPin, Loader2, Send } from "lucide-react";
import { emailService } from "@/api/emailService";
import { toast } from "sonner";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Sending your message...");

    try {
      await emailService.sendSupportEmail({
        subject: formData.subject,
        message: formData.message,
        userEmail: formData.email
      });
      toast.success("Message sent! We'll get back to you soon.", { id: toastId });
      setFormData({ email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message. Please try again or contact us directly at aihealthtec@gmail.com", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

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
              Have questions or feedback? We'd love to hear from you. Please reach out to our team using the methods below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
                    <Mail className="w-8 h-8 text-indigo-500 mb-4" />
                    <h3 className="text-slate-900 font-bold mb-2">Email Support</h3>
                    <p className="text-sm text-slate-600">aihealthtec@gmail.com</p>
                    <p className="text-xs text-slate-400 mt-2">Expect a reply within 12-24 hours</p>
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
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Your Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" 
                    placeholder="john@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    id="subject" 
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" 
                    placeholder="How can we help?" 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea 
                    id="message" 
                    rows={5} 
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-y" 
                    placeholder="Type your message here..." 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-2xl text-center">
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Media & Partnerships</h3>
              <p className="text-sm text-indigo-700">
                For inquiries or partnerships, please email <br/><a href="mailto:aihealthtec@gmail.com" className="font-bold underline text-indigo-600 hover:text-indigo-800">aihealthtec@gmail.com</a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
