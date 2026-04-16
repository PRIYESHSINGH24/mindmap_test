import React, { useMemo } from 'react';
import { 
  ExternalLink, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  XCircle,
  TrendingUp,
  BrainCircuit,
  Trash2,
  Code2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { problemService, Problem } from '@/services/problemService';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Props {
  onSelectProblem: (id: string) => void;
}

export default function ProblemList({ onSelectProblem }: Props) {
  const { problems, searchQuery, filterDifficulty, filterStatus } = useStore();

  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesDifficulty = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;

      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [problems, searchQuery, filterDifficulty, filterStatus]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-[#10B981]/10 text-[#10B981] border-none';
      case 'Medium': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-none';
      case 'Hard': return 'bg-[#EF4444]/10 text-[#EF4444] border-none';
      default: return 'bg-[#4B5563]/10 text-[#4B5563] border-none';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Solved': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'Revision Pending': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Failed': return <XCircle className="h-4 w-4 text-rose-500" />;
      default: return null;
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this problem?')) {
      try {
        await problemService.deleteProblem(id);
        toast.success('Problem deleted');
      } catch (err) {
        toast.error('Failed to delete problem');
      }
    }
  };

  if (filteredProblems.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
        <div className="p-4 bg-secondary/50 rounded-2xl w-fit mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">No problems found</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#141417] rounded-2xl border border-[#2A2A2E] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#2A2A2E] flex justify-between items-center">
        <h2 className="font-serif italic text-lg">Problem Vault</h2>
        <span className="text-[11px] text-[#4B5563] font-bold uppercase tracking-widest">{filteredProblems.length} Problems</span>
      </div>
      <Table className="problem-table">
        <TableHeader>
          <TableRow className="border-[#2A2A2E] hover:bg-transparent">
            <TableHead className="w-[400px] text-[#4B5563] uppercase text-[11px] tracking-wider font-bold">Title</TableHead>
            <TableHead className="text-[#4B5563] uppercase text-[11px] tracking-wider font-bold">Difficulty</TableHead>
            <TableHead className="text-[#4B5563] uppercase text-[11px] tracking-wider font-bold">Tags</TableHead>
            <TableHead className="text-[#4B5563] uppercase text-[11px] tracking-wider font-bold">Date</TableHead>
            <TableHead className="text-right text-[#4B5563] uppercase text-[11px] tracking-wider font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProblems.map((problem) => (
            <TableRow 
              key={problem.id} 
              className="group cursor-pointer border-[#2A2A2E] hover:bg-white/[0.02] transition-colors"
              onClick={() => problem.id && onSelectProblem(problem.id)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full ${
                    problem.status === 'Solved' ? 'bg-[#10B981]' : 
                    problem.status === 'Failed' ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'
                  }`} />
                  <span className="font-medium text-[0.95rem] text-white transition-colors">
                    {problem.title}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className={`text-[0.7rem] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1.5">
                  {problem.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[0.75rem] bg-[#2A2A2E] text-[#9CA3AF] px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                  {problem.tags.length > 2 && (
                    <span className="text-[0.75rem] text-[#4B5563]">+{problem.tags.length - 2}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-[0.85rem] text-[#9CA3AF]">
                {problem.dateSolved ? format(new Date(problem.dateSolved), 'MMM d') : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {problem.url && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-[#4B5563] hover:text-white"
                      onClick={(e) => { e.stopPropagation(); window.open(problem.url, '_blank'); }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#4B5563] hover:text-white" onClick={e => e.stopPropagation()}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#141417] border-[#2A2A2E]">
                      <DropdownMenuItem onClick={() => problem.id && onSelectProblem(problem.id)} className="text-white hover:bg-[#2A2A2E]">
                        <Code2 className="h-4 w-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive hover:bg-destructive/10" onClick={(e) => problem.id && handleDelete(e, problem.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BookOpen(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
