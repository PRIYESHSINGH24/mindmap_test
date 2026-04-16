import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  LayoutDashboard, 
  BookOpen, 
  RotateCw, 
  FolderPlus, 
  LogOut, 
  BrainCircuit,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical,
  ExternalLink,
  Code2,
  Trash2,
  Edit2,
  ChevronRight,
  TrendingUp,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { problemService, Problem } from '@/services/problemService';
import { aiService } from '@/services/aiService';
import { useStore } from '@/lib/store';
import { format } from 'date-fns';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Components
import ProblemForm from '@/components/problems/ProblemForm';
import Dashboard from '@/components/dashboard/Dashboard';
import ProblemList from '@/components/problems/ProblemList';
import ProblemViewer from '@/components/problems/ProblemViewer';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  
  const { 
    setProblems, 
    searchQuery, 
    setSearchQuery,
    filterDifficulty,
    setFilterDifficulty,
    filterStatus,
    setFilterStatus
  } = useStore();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = problemService.subscribeToUserProblems((problems) => {
        setProblems(problems);
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <BrainCircuit className="h-12 w-12 text-primary mb-4" />
          <p className="text-muted-foreground">Initializing AlgoMinder...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
        </div>

        <div className="z-10 text-center max-w-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 backdrop-blur-sm">
              <BrainCircuit className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-6xl font-black tracking-tight text-white mb-4 italic">
            AlgoMinder
          </h1>
          <p className="text-xl text-neutral-400 mb-8 max-w-lg mx-auto">
            Your intelligent DSA notebook. Track problems, analyze patterns, and master algorithms with AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={async () => {
                try {
                  await authService.loginWithGoogle();
                } catch (error: any) {
                  if (error.code === 'auth/operation-not-allowed') {
                    toast.error('Google login is not enabled in Firebase Console.');
                  } else if (error.code !== 'auth/popup-closed-by-user') {
                    toast.error('Google login failed. Please try again.');
                  }
                }
              }}
              className="px-8 h-14 text-lg bg-white text-black hover:bg-white/90"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={async () => {
                try {
                  await authService.loginWithGithub();
                } catch (error: any) {
                  if (error.code === 'auth/operation-not-allowed') {
                    toast.error('GitHub login is not enabled in Firebase Console.');
                  } else if (error.code !== 'auth/popup-closed-by-user') {
                    toast.error('GitHub login failed. Please try again.');
                  }
                }
              }}
              className="px-8 h-14 text-lg border-white/20 hover:bg-white/5"
            >
              GitHub Sync
            </Button>
          </div>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl z-10">
          {[
            { title: "Smart Tagging", desc: "AI-powered pattern detection and topic classification.", icon: <BrainCircuit className="h-5 w-5" /> },
            { title: "Progress Analytics", desc: "Comprehensive stats, topic breakdowns, and heatmaps.", icon: <TrendingUp className="h-5 w-5" /> },
            { title: "Revision System", desc: "Spaced repetition to ensure you never forget concepts.", icon: <History className="h-5 w-5" /> }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              <div className="mb-4 text-primary">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background text-foreground dark">
        <Toaster position="top-right" richColors />
        
        {/* Sidebar */}
        <div className="w-60 border-r border-[#2A2A2E] bg-[#141417] flex flex-col h-full z-20">
          <div className="p-8 mb-4">
            <h1 className="text-2xl font-serif italic font-medium tracking-tight border-b border-[#2A2A2E] pb-6">SmartDSA</h1>
          </div>
          
          <div className="px-0 mb-6 flex-1">
            <nav className="space-y-0">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'problems', label: 'Problem Vault', icon: BookOpen },
                { id: 'revisions', label: 'Revision Queue', icon: RotateCw },
                { id: 'analysis', label: 'Analysis Lab', icon: BrainCircuit },
                { id: 'collections', label: 'Collections', icon: FolderPlus },
              ].map((item) => (
                <button
                  key={item.id}
                  className={`w-full flex items-center gap-3 px-8 py-3.5 transition-all text-[0.9rem] border-l-2
                    ${activeTab === item.id 
                      ? 'text-[#6366F1] bg-[#6366F1]/5 border-[#6366F1]' 
                      : 'text-[#9CA3AF] border-transparent hover:text-white'
                    }`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedProblemId(null);
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6 border-t border-[#2A2A2E] space-y-4">
            <div className="text-[11px] text-[#4B5563] font-medium tracking-wider uppercase">
              Last Sync: 2m ago
            </div>
            
            <div className="flex items-center gap-3 py-2 rounded-xl transition-colors">
              <div className="h-9 w-9 rounded-full bg-[#6366F1] flex items-center justify-center overflow-hidden border border-white/10">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" />
                ) : (
                  <span className="text-white text-xs font-bold uppercase">
                    {user.displayName?.[0] || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.85rem] font-medium truncate text-white">{user.displayName || 'Developer'}</p>
                <p className="text-[0.75rem] text-[#4B5563] truncate">Lvl 42 Coder</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => authService.logout()}
                className="text-[#4B5563] hover:text-destructive h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            <Dialog>
              <DialogTrigger className="w-full">
                <Button className="w-full rounded-lg bg-[#6366F1] hover:bg-[#6366F1]/90 text-white shadow-lg shadow-[#6366F1]/20 font-medium py-6">
                  <Plus className="h-4 w-4 mr-2" />
                  New Problem
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-[#141417] border-[#2A2A2E]">
                <ProblemForm onSuccess={() => toast.success('Problem added successfully!')} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#0A0A0B]">
          {/* Header */}
          <header className="h-24 flex items-center justify-between px-10 z-10">
            <div className="flex-1 max-w-xl">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4B5563]" />
                <input 
                  placeholder="Search problems, tags, or patterns... (Cmd + K)" 
                  className="w-full bg-[#141417] border border-[#2A2A2E] pl-11 pr-4 py-2.5 rounded-lg text-sm text-white placeholder:text-[#4B5563] outline-none transition-all focus:border-[#6366F1]/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger className="w-[140px] h-10 bg-transparent border-[#2A2A2E] text-[#9CA3AF] rounded-lg">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141417] border-[#2A2A2E]">
                    <SelectItem value="All">All Difficulty</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px] h-10 bg-transparent border-[#2A2A2E] text-[#9CA3AF] rounded-lg">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141417] border-[#2A2A2E]">
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Solved">Solved</SelectItem>
                    <SelectItem value="Revision Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-8">
            {selectedProblemId ? (
              <div className="max-w-7xl mx-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedProblemId(null)}
                  className="mb-6 h-10 px-0 hover:bg-transparent text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
                  Back to {activeTab}
                </Button>
                <ProblemViewer problemId={selectedProblemId} />
              </div>
            ) : (
              <div className="max-w-7xl mx-auto">
                {activeTab === 'dashboard' && <Dashboard onSelectProblem={setSelectedProblemId} />}
                {activeTab === 'problems' && <ProblemList onSelectProblem={setSelectedProblemId} />}
                {activeTab === 'revisions' && (
                  <div className="text-center py-20">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Revision Queue</h2>
                    <p className="text-muted-foreground">Spaced repetition system coming soon.</p>
                  </div>
                )}
                {activeTab === 'collections' && (
                  <div className="text-center py-20">
                    <FolderPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">My Collections</h2>
                    <p className="text-muted-foreground">Organize your problems into groups.</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
