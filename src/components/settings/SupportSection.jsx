import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function SupportSection({ userEmail }) {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      setStatus({ type: "error", text: "Please fill in both subject and message" });
      return;
    }

    try {
      setLoading(true);
      await base44.integrations.Core.SendEmail({
        to: "support@wealthlens.com",
        subject: `Support Request: ${subject}`,
        body: `From: ${userEmail}\n\n${message}`,
        from_name: "WealthLens Support"
      });
      setStatus({ type: "success", text: "Message sent! We'll get back to you soon." });
      setSubject("");
      setMessage("");
      setTimeout(() => setStatus(null), 5000);
    } catch (error) {
      setStatus({ type: "error", text: "Failed to send message. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Mail className="w-5 h-5 text-indigo-400" />
        Support
      </h3>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4">

        {/* Email Input */}
        <div>
          <label className="text-xs text-slate-400 mb-2 block">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's the issue?"
            className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-colors"
          />
        </div>

        {/* Message Input */}
        <div>
          <label className="text-xs text-slate-400 mb-2 block">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what happened..."
            rows="4"
            className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition-colors resize-none"
          />
        </div>

        {/* Status Messages */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-3 rounded-lg ${
              status.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}>
            {status.type === "success" ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-sm">{status.text}</span>
          </motion.div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSendEmail}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
          <Send className="w-4 h-4 mr-2" />
          {loading ? "Sending..." : "Send Message"}
        </Button>

        {/* Help Text */}
        <p className="text-xs text-slate-400 text-center pt-2">
          We typically respond within 24 hours
        </p>
      </motion.div>
    </div>
  );
}