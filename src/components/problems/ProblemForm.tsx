import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  BrainCircuit, 
  Loader2, 
  Link as LinkIcon,
  Tag as TagIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DialogFooter } from '@/components/ui/dialog';
import { problemService } from '@/services/problemService';
import { aiService } from '@/services/aiService';
import { toast } from 'sonner';

interface Props {
  onSuccess?: () => void;
}

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const PLATFORMS = ['LeetCode', 'Codeforces', 'HackerRank', 'GeeksForGeeks', 'Other'];
const STATUSES = ['Solved', 'Revision Pending', 'Failed'];

export default function ProblemForm({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('LeetCode');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState<any>('Medium');
  const [status, setStatus] = useState<any>('Solved');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [smartTags, setSmartTags] = useState<string[]>([]);

  const handleAddTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleAnalyzeWithAI = async () => {
    if (!title) {
      toast.error('Please enter a problem title first');
      return;
    }
    setAiLoading(true);
    try {
      const result = await aiService.detectPatterns(title);
      setSmartTags(result.patterns);
      if (result.suggestedTags?.length) {
        setTags(prev => Array.from(new Set([...prev, ...result.suggestedTags])));
      }
      toast.success('AI Analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze with AI');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await problemService.addProblem({
        title,
        platform,
        url,
        difficulty,
        status,
        tags,
        smartTags,
        timeTaken: 0,
        attempts: 1,
        dateSolved: new Date().toISOString(),
      });
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to add problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="title">Problem Title</Label>
            <div className="relative">
              <Input 
                id="title" 
                placeholder="e.g. Two Sum" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleAnalyzeWithAI}
                disabled={aiLoading}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary"
              >
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="w-1/3 space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url" className="flex items-center gap-2">
            <LinkIcon className="h-3 w-3" /> Problem URL
          </Label>
          <Input 
            id="url" 
            placeholder="https://leetcode.com/problems/..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <TagIcon className="h-3 w-3" /> Tags
          </Label>
          <div className="flex gap-2">
            <Input 
              placeholder="Add a tag..." 
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1"
            />
            <Button type="button" variant="secondary" onClick={handleAddTag}>Add</Button>
          </div>
          
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {tags.map(tag => (
              <Badge key={tag} className="flex items-center gap-1 pr-1 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                {tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
            {smartTags.map(tag => (
              <Badge key={tag} className="bg-primary/20 text-primary border-primary/30 flex items-center gap-1">
                <BrainCircuit className="h-3 w-3" /> {tag}
              </Badge>
            ))}
            {tags.length === 0 && smartTags.length === 0 && (
              <span className="text-xs text-muted-foreground italic">No tags added yet.</span>
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="pt-4 border-t">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[120px]">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Add to Notebook
        </Button>
      </DialogFooter>
    </form>
  );
}
