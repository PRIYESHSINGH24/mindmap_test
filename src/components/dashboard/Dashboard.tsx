import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  Plus,
  Flame,
  Trophy,
  Target,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore } from '@/lib/store';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

interface Props {
  onSelectProblem: (id: string) => void;
}

export default function Dashboard({ onSelectProblem }: Props) {
  const { problems } = useStore();

  const stats = useMemo(() => {
    const total = problems.length;
    const solved = problems.filter(p => p.status === 'Solved').length;
    const easy = problems.filter(p => p.difficulty === 'Easy').length;
    const medium = problems.filter(p => p.difficulty === 'Medium').length;
    const hard = problems.filter(p => p.difficulty === 'Hard').length;
    
    // Topic breakdown
    const topics: Record<string, number> = {};
    problems.forEach(p => {
      p.tags.forEach(tag => {
        topics[tag] = (topics[tag] || 0) + 1;
      });
    });
    
    const sortedTopics = Object.entries(topics)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const difficultyData = [
      { name: 'Easy', value: easy, color: '#10b981' },
      { name: 'Medium', value: medium, color: '#f59e0b' },
      { name: 'Hard', value: hard, color: '#f43f5e' },
    ];

    return { total, solved, easy, medium, hard, sortedTopics, difficultyData };
  }, [problems]);

  // Activity Heatmap Generation (Dummy for visualization)
  const heatmapData = useMemo(() => {
    const data = [];
    const today = startOfDay(new Date());
    for (let i = 20; i >= 0; i--) {
      const date = subDays(today, i);
      const dayProblems = problems.filter(p => p.dateSolved && isSameDay(new Date(p.dateSolved), date));
      data.push({
        date: format(date, 'MMM d'),
        count: dayProblems.length,
        intensity: Math.min(dayProblems.length, 4)
      });
    }
    return data;
  }, [problems]);

  return (
    <div className="space-y-10 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif italic font-medium tracking-tight">Performance Dashboard</h1>
          <p className="text-[#9CA3AF] mt-1 text-sm">Real-time analysis of your problem solving journey.</p>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Solved', value: stats.solved },
          { label: 'Current Streak', value: '14 Days' },
          { label: 'Pending Revision', value: '12' },
          { label: 'Weak Topic (AI)', value: 'Dynamic Programming', status: 'hard' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className={`stat-value ${stat.status === 'hard' ? 'text-[#EF4444]' : 'text-[#F9FAFB]'}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#141417] border border-[#2A2A2E] rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#2A2A2E] flex justify-between items-center">
            <h2 className="font-serif italic text-lg">Recent Distribution</h2>
            <span className="text-[0.85rem] text-[#6366F1] cursor-pointer">View All</span>
          </div>
          <div className="h-[300px] p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.sortedTopics} layout="vertical" margin={{ left: -20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={100} 
                  className="text-[12px] font-medium fill-[#9CA3AF]"
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid #2A2A2E', borderRadius: '8px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {stats.sortedTopics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#6366F1" fillOpacity={1 - index * 0.1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="heatmap border-t border-[#2A2A2E]">
            {heatmapData.map((day, i) => (
              <div 
                key={i}
                title={`${day.date}: ${day.count} solved`}
                className={`heat-cell ${
                  day.intensity === 0 ? '' : 
                  day.intensity === 1 ? 'active-1' :
                  day.intensity === 2 ? 'active-2' : 'active-3'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-[#141417] border border-[#2A2A2E] rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#2A2A2E]">
            <h2 className="font-serif italic text-lg">AI Intelligence</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <span className="ai-badge">PATTERN DETECTED</span>
              <div className="ai-suggestion">
                <div className="text-[0.9rem] font-medium mb-2 text-white">Sliding Window Optimization</div>
                <div className="text-[0.8rem] text-[#9CA3AF] leading-relaxed">
                  Your recent solutions for "Substring" problems are O(N²). You can reduce this to O(N) using a frequency map.
                </div>
              </div>
            </div>

            <div>
              <span className="ai-badge bg-gradient-to-r from-amber-500 to-orange-500">REVISION SUGGESTION</span>
              <div className="ai-suggestion border-amber-500">
                <div className="text-[0.9rem] font-medium mb-1 text-white">K-th Smallest Element</div>
                <div className="text-[0.8rem] text-[#9CA3AF]">
                  Spaced repetition due. You failed this 3 times in September.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
