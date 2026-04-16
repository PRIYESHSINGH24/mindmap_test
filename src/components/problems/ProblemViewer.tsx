import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Code2, 
  BrainCircuit, 
  Save, 
  History,
  Languages,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  FileText
} from 'lucide-react';
import { Editor } from '@monaco-editor/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { problemService, Problem } from '@/services/problemService';
import { solutionService, Solution } from '@/services/solutionService';
import { noteService, Note } from '@/services/noteService';
import { aiService } from '@/services/aiService';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Props {
  problemId: string;
}

const LANGUAGES = [
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
  { label: 'Python', value: 'python' },
  { label: 'JavaScript', value: 'javascript' },
];

export default function ProblemViewer({ problemId }: Props) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [note, setNote] = useState<Note | null>(null);
  
  const [activeTab, setActiveTab] = useState('code');
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [noteContent, setNoteContent] = useState('');
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const p = await problemService.getProblem(problemId);
      setProblem(p);
      
      const n = await noteService.getNoteByProblemId(problemId);
      setNote(n);
      if (n) setNoteContent(n.content);
    };
    
    loadData();
    
    const unsubscribeSolutions = solutionService.subscribeToProblemSolutions(problemId, (sols) => {
      setSolutions(sols);
      if (sols.length > 0 && !code) {
        setCode(sols[0].code);
        setSelectedLanguage(sols[0].language);
      }
    });

    return () => unsubscribeSolutions();
  }, [problemId]);

  const handleSaveSolution = async () => {
    setSaveLoading(true);
    try {
      const version = solutions.length + 1;
      await solutionService.addSolution(problemId, selectedLanguage, code, version);
      toast.success('Solution saved');
    } catch (err) {
      toast.error('Failed to save solution');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveNote = async () => {
    setSaveLoading(true);
    try {
      const nid = await noteService.saveNote(problemId, noteContent, note?.id);
      if (!note) setNote({ problemId, content: noteContent, uid: '', updatedAt: new Date(), id: nid as string });
      toast.success('Notes updated');
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAiHint = async () => {
    if (!problem) return;
    setAiLoading(true);
    try {
      const response = await aiService.generateOptimizedSolution(problem.title, selectedLanguage);
      toast.info('AI optimization generated');
      // Append AI suggestion to notes or show in modal
      setNoteContent(prev => prev + `\n\n### AI Optimized Solution (${selectedLanguage})\n\n` + response);
      setActiveTab('notes');
    } catch (err) {
      toast.error('AI assistant failed');
    } finally {
      setAiLoading(false);
    }
  };

  if (!problem) return <div className="animate-pulse">Loading problem details...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight italic">{problem.title}</h1>
            <Badge variant="outline" className="bg-secondary/50">{problem.platform}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3">{problem.difficulty}</Badge>
            <div className="flex gap-2">
              {problem.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs bg-muted/30">{tag}</Badge>
              ))}
              {problem.smartTags?.map(tag => (
                <Badge key={tag} className="bg-primary/10 text-primary border-primary/20 text-xs">
                  <BrainCircuit className="h-3 w-3 mr-1" /> {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleAiHint} disabled={aiLoading}>
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            AI Optimization
          </Button>
          <Button size="sm" onClick={activeTab === 'code' ? handleSaveSolution : handleSaveNote} disabled={saveLoading}>
            <Save className="h-4 w-4 mr-2" />
            {saveLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4 bg-card p-1 rounded-xl border border-border">
          <TabsList className="bg-transparent border-none">
            <TabsTrigger value="code" className="data-[state=active]:bg-secondary transition-all flex items-center gap-2 px-6">
              <Code2 className="h-4 w-4" /> Code
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-secondary transition-all flex items-center gap-2 px-6">
              <FileText className="h-4 w-4" /> Notes & Analysis
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-secondary transition-all flex items-center gap-2 px-6">
              <History className="h-4 w-4" /> Version History
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'code' && (
            <div className="flex items-center gap-2 pr-2">
              <Languages className="h-4 w-4 text-muted-foreground mr-1" />
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[140px] h-9 border-none bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <TabsContent value="code" className="mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-4 gap-6 h-[calc(100vh-280px)]">
            <div className="col-span-3 border border-border rounded-2xl overflow-hidden bg-card">
              <Editor
                height="100%"
                defaultLanguage={selectedLanguage}
                language={selectedLanguage}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  padding: { top: 20 },
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  lineNumbers: 'on',
                  glyphMargin: false,
                  folding: true,
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 3,
                }}
              />
            </div>
            
            <div className="col-span-1 space-y-4 h-full flex flex-col">
              <Card className="flex-1 bg-card border-border overflow-hidden flex flex-col">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Live Preview
                    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded font-mono uppercase">
                      {selectedLanguage}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex-1 overflow-auto bg-muted/30">
                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                    {code || '// Start writing your code...'}
                  </pre>
                </CardContent>
              </Card>
              
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                <div className="flex items-center gap-2 text-primary mb-2">
                  <BrainCircuit className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Quick Hint</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                  "Remember to handle edge cases like empty arrays or large integer overflows."
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-2 gap-6 h-[calc(100vh-280px)]">
            <div className="flex flex-col border border-border rounded-2xl overflow-hidden bg-card">
              <div className="p-3 bg-secondary/30 border-b flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">MARKKOWN EDITOR</span>
                <span className="text-[10px] text-muted-foreground italic">Supports GFM</span>
              </div>
              <textarea
                className="flex-1 p-6 bg-transparent resize-none focus:outline-none font-mono text-sm"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Break down your approach, complexity, and common mistakes..."
              />
            </div>
            
            <div className="flex flex-col border border-border rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm">
               <div className="p-3 bg-secondary/30 border-b">
                <span className="text-xs font-semibold text-muted-foreground">PREVIEW</span>
              </div>
              <ScrollArea className="flex-1 p-8 prose dark:prose-invert max-w-none">
                <div className="markdown-body">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {noteContent || '*No content yet. Start typing to see the preview...*'}
                  </Markdown>
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0 focus-visible:outline-none">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              {solutions.length > 0 ? (
                <div className="space-y-4">
                  {solutions.map((sol, i) => (
                    <div key={sol.id} className="p-4 bg-secondary/20 rounded-xl border border-border flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                          v{sol.version || solutions.length - i}
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2 capitalize">
                             {sol.language} 
                             <span className="text-xs font-normal text-muted-foreground underline decoration-dotted">Version {sol.version}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sol.createdAt ? format(new Date(sol.createdAt.seconds * 1000), 'PPP p') : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="sm" onClick={() => { setCode(sol.code); setSelectedLanguage(sol.language); setActiveTab('code'); }}>
                           Restore
                         </Button>
                         <Button variant="ghost" size="sm" className="text-destructive" onClick={() => sol.id && solutionService.deleteSolution(sol.id)}>
                           Delete
                         </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No solution history available yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
