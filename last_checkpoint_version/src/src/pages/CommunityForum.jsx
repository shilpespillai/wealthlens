import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, MessageSquarePlus, TrendingUp, HelpCircle, X, ChevronLeft, Send, User } from "lucide-react";

const defaultThreads = [
  {
    id: 1,
    title: 'Modeling the "Boglehead" 3-Fund Portfolio?',
    preview: 'How are people mimicking the historical returns of VTI + VXUS + BND in the calculator?',
    tag: 'Strategies',
    author: 'indexUser99',
    replies: 2,
    timeAgo: '2 hours ago',
    lastReplyBy: 'Alex_B',
    icon: 'TrendingUp',
    iconColor: 'text-emerald-500',
    tagColor: 'bg-emerald-100 text-emerald-700',
    repliesList: [
      { id: 101, author: 'BogleFan', content: 'I usually just set my own custom asset allocations, representing VTI as 60%, VXUS as 20%, BND as 20% in the portfolio tab.', timeAgo: '1 hour ago' },
      { id: 102, author: 'Alex_B', content: 'Same here. The calculator handles custom inputs well. Just make sure the expected return assumptions match historical norms.', timeAgo: '2 hours ago' }
    ]
  },
  {
    id: 2,
    title: 'Feature Request: Different Tax Rates by Account Type',
    preview: 'It would be great if the calculator could separate out Roth vs Traditional 401k modeling where tax is taken before or after.',
    tag: 'Feedback',
    author: 'TaxPlanner1',
    replies: 1,
    timeAgo: '1 day ago',
    lastReplyBy: 'DevTeam_Sam',
    icon: 'HelpCircle',
    iconColor: 'text-indigo-500',
    tagColor: 'bg-indigo-100 text-indigo-700',
    repliesList: [
      { id: 201, author: 'DevTeam_Sam', content: 'Thanks for the feedback! This is on our roadmap for Q3. In the meantime, you can simulate a Blended tax rate in the advanced settings.', timeAgo: '1 day ago' }
    ]
  },
  {
    id: 3,
    title: 'Impact of High Inflation on FIRE timelines',
    preview: 'If I bump the inflation projection to 4%, my target retirement date shifts by nearly 7 years. Does this seem accurate based on historical data?',
    tag: 'Economics',
    author: 'FI_Seeker',
    replies: 1,
    timeAgo: '3 days ago',
    lastReplyBy: 'MacroNerd',
    icon: 'TrendingUp',
    iconColor: 'text-amber-500',
    tagColor: 'bg-amber-100 text-amber-700',
    repliesList: [
      { id: 301, author: 'MacroNerd', content: 'Yes, sequence of returns and prolonged high inflation devastate compounding. 7 years is not an unreasonable shift if you maintain the same savings rate.', timeAgo: '3 days ago' }
    ]
  }
];

const IconMap = {
    TrendingUp: TrendingUp,
    HelpCircle: HelpCircle,
    MessageSquarePlus: MessageSquarePlus
};

export default function CommunityForum() {
  const [threads, setThreads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // View state
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  
  // form state
  const [newTitle, setNewTitle] = useState("");
  const [newPreview, setNewPreview] = useState("");
  const [newTag, setNewTag] = useState("General");

  useEffect(() => {
    const saved = localStorage.getItem("wealthlens_forum_threads");
    if (saved) {
      try {
        setThreads(JSON.parse(saved));
      } catch (e) {
        setThreads(defaultThreads);
      }
    } else {
      setThreads(defaultThreads);
    }
  }, []);

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPreview.trim()) return;

    const newThread = {
      id: Date.now(),
      title: newTitle,
      preview: newPreview,
      tag: newTag,
      author: 'You',
      replies: 0,
      timeAgo: 'Just now',
      lastReplyBy: 'None',
      icon: 'MessageSquarePlus',
      iconColor: 'text-blue-500',
      tagColor: 'bg-blue-100 text-blue-700',
      repliesList: []
    };

    const updatedThreads = [newThread, ...threads];
    setThreads(updatedThreads);
    localStorage.setItem("wealthlens_forum_threads", JSON.stringify(updatedThreads));
    
    setNewTitle("");
    setNewPreview("");
    setNewTag("General");
    setIsModalOpen(false);
    
    // Automatically open the new thread
    setActiveThreadId(newThread.id);
  };

  const clearThreads = () => {
    if (window.confirm("Reset to default threads?")) {
      localStorage.removeItem("wealthlens_forum_threads");
      setThreads(defaultThreads);
      setActiveThreadId(null);
    }
  };

  const handlePostReply = (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    const newReply = {
      id: Date.now(),
      author: 'You',
      content: replyContent,
      timeAgo: 'Just now'
    };

    const updatedThreads = threads.map(thread => {
      if (thread.id === activeThreadId) {
        return {
          ...thread,
          replies: thread.replies + 1,
          timeAgo: 'Just now',
          lastReplyBy: 'You',
          repliesList: [...(thread.repliesList || []), newReply]
        };
      }
      return thread;
    });

    setThreads(updatedThreads);
    localStorage.setItem("wealthlens_forum_threads", JSON.stringify(updatedThreads));
    setReplyContent("");
  };

  const activeThread = activeThreadId ? threads.find(t => t.id === activeThreadId) : null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            {activeThreadId ? (
                <button onClick={() => setActiveThreadId(null)} className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Topics
                </button>
            ) : (
                <a href="/" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Calculator
                </a>
            )}
            
            <div className="flex gap-4">
              {!activeThreadId && (
                  <button 
                    onClick={clearThreads}
                    className="text-slate-500 hover:text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Reset
                  </button>
              )}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center shadow-sm text-sm"
              >
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  New Thread
              </button>
            </div>
        </div>
        
        {activeThreadId && activeThread ? (
            /* Thread View */
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Original Post */}
                <div className="p-8 border-b border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${activeThread.tagColor}`}>{activeThread.tag}</span>
                        <span className="text-sm text-slate-500">{activeThread.timeAgo}</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">{activeThread.title}</h1>
                    
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-slate-900">{activeThread.author}</div>
                            <p className="text-slate-700 mt-2 whitespace-pre-wrap leading-relaxed">{activeThread.preview}</p>
                        </div>
                    </div>
                </div>

                {/* Replies */}
                <div className="bg-slate-50 p-8">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Replies ({activeThread.replies || 0})</h3>
                    
                    <div className="space-y-6">
                        {(activeThread.repliesList || []).map(reply => (
                            <div key={reply.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-slate-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-bold text-slate-900">{reply.author}</div>
                                        <div className="text-xs text-slate-400">{reply.timeAgo}</div>
                                    </div>
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{reply.content}</p>
                                </div>
                            </div>
                        ))}

                        {(!activeThread.repliesList || activeThread.repliesList.length === 0) && (
                            <div className="text-center py-8 text-slate-500 italic">
                                No replies yet. Be the first to join the discussion!
                            </div>
                        )}
                    </div>
                    
                    {/* Reply Form */}
                    <div className="mt-8 pt-8 border-t border-slate-200">
                        <form onSubmit={handlePostReply} className="relative">
                            <textarea 
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Type your reply here..."
                                rows={4}
                                className="w-full bg-white border border-slate-300 rounded-2xl p-4 pr-16 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-y"
                                required
                            />
                            <button 
                                type="submit"
                                disabled={!replyContent.trim()}
                                className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors shadow-sm"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        ) : (
            /* Thread List View */
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Community Forum</h1>
                        <p className="text-slate-500 mt-1">Discuss investment strategies and tool modeling with fellow WealthLens users.</p>
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    {/* Category / Thread Header */}
                    <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:grid">
                        <div className="col-span-8">Discussion Topic</div>
                        <div className="col-span-2 text-center">Replies</div>
                        <div className="col-span-2 text-right">Latest Activity</div>
                    </div>

                    {/* Forum Rows */}
                    <div className="divide-y divide-slate-100">
                        {threads.map(thread => {
                            const IconComponent = IconMap[thread.icon] || MessageSquarePlus;
                            return (
                                <div 
                                    key={thread.id} 
                                    onClick={() => setActiveThreadId(thread.id)}
                                    className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-8 hover:bg-slate-50 transition-colors items-center cursor-pointer"
                                >
                                    <div className="col-span-1 sm:col-span-8">
                                        <div className="flex items-start gap-4">
                                            <IconComponent className={`w-5 h-5 mt-1 shrink-0 ${thread.iconColor}`} />
                                            <div>
                                                <div className="font-bold text-lg text-slate-900 hover:text-indigo-600 block mb-1">{thread.title}</div>
                                                <p className="text-sm text-slate-500 line-clamp-1 mb-2">{thread.preview}</p>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className={`px-2 py-0.5 rounded font-medium ${thread.tagColor}`}>{thread.tag}</span>
                                                    <span className="text-slate-400">Started by <strong className="text-slate-600">{thread.author}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-1 sm:col-span-2 sm:text-center text-slate-600 text-sm font-medium mt-2 sm:mt-0">
                                        <span className="sm:hidden font-bold pr-2 text-slate-400">Replies:</span>{thread.replies}
                                    </div>
                                    <div className="col-span-1 sm:col-span-2 text-left sm:text-right text-xs mt-2 sm:mt-0">
                                        <p className="text-slate-900 font-medium">{thread.timeAgo}</p>
                                        <p className="text-slate-500">by <span className="text-indigo-600">{thread.lastReplyBy}</span></p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* New Thread Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Create New Thread</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateThread} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Thread Title</label>
                  <input 
                    type="text" 
                    id="title" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" 
                    placeholder="e.g. How to model HSA contributions?" 
                    required 
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="tag" className="block text-sm font-medium text-slate-700 mb-1">Category Tag</label>
                  <select 
                    id="tag" 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-white" 
                  >
                    <option value="General">General</option>
                    <option value="Strategies">Strategies</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Economics">Economics</option>
                    <option value="Tax Planning">Tax Planning</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="preview" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea 
                    id="preview" 
                    rows={6}
                    value={newPreview}
                    onChange={(e) => setNewPreview(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-y" 
                    placeholder="Describe what you want to discuss..." 
                    required
                  ></textarea>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Post Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
