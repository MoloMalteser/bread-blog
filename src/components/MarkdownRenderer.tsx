
import React, { useEffect, useState } from 'react';
import { usePolls, Poll } from '@/hooks/usePolls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MarkdownRendererProps {
  content: string;
  postId?: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, postId, className = '' }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const { getPollsForPost, voteOnPoll, getPollResults, hasUserVoted } = usePolls();

  useEffect(() => {
    if (postId) {
      getPollsForPost(postId).then(setPolls);
    }
  }, [postId]);

  const handleVote = async (pollId: string, optionIndex: number) => {
    const success = await voteOnPoll(pollId, optionIndex);
    if (success && postId) {
      // Refresh polls after voting
      const updatedPolls = await getPollsForPost(postId);
      setPolls(updatedPolls);
    }
  };

  const PollComponent: React.FC<{ poll: Poll }> = ({ poll }) => {
    const results = getPollResults(poll);
    const userVote = hasUserVoted(poll);
    const hasVoted = userVote !== null;

    return (
      <Card className="p-4 my-4 bg-muted/30 border-2 border-primary/20">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <span>📊</span>
          {poll.title}
        </h4>
        
        <div className="space-y-2">
          {poll.options.map((option, index) => {
            const percentage = results.percentages[index];
            const votes = results.optionCounts[index];
            const isSelected = userVote === index;
            
            return (
              <div key={index} className="relative">
                <Button
                  onClick={() => !hasVoted && handleVote(poll.id, index)}
                  disabled={hasVoted}
                  variant={isSelected ? "default" : "ghost"}
                  className={`w-full justify-start p-3 h-auto relative overflow-hidden ${
                    hasVoted ? 'cursor-default' : 'hover:bg-muted/70'
                  }`}
                >
                  {hasVoted && (
                    <div 
                      className="absolute inset-0 bg-primary/10 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  
                  <div className="flex items-center justify-between w-full relative z-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className={isSelected ? 'font-medium' : ''}>{option}</span>
                    </div>
                    
                    {hasVoted && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{votes} Stimme{votes !== 1 ? 'n' : ''}</span>
                        <span>({percentage.toFixed(1)}%)</span>
                      </div>
                    )}
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
        
        {hasVoted && (
          <div className="mt-3 text-sm text-muted-foreground">
            Insgesamt {results.totalVotes} Stimme{results.totalVotes !== 1 ? 'n' : ''} abgegeben
          </div>
        )}
      </Card>
    );
  };
  // Enhanced markdown parser 
  const parseMarkdown = (text: string) => {
    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *italic* to <em>
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert ~~strikethrough~~ to <del>
    text = text.replace(/~~(.*?)~~/g, '<del class="opacity-75">$1</del>');
    
    // Convert `code` to <code>
    text = text.replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded-lg text-sm font-mono">$1</code>');
    
    // Convert images ![alt](src) with better styling
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-xl my-4 shadow-lg border border-border" loading="lazy" />');
    
    // Convert line breaks to <br>
    text = text.replace(/\n/g, '<br />');
    
    // Convert ### Headers
    text = text.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>');
    
    // Convert ## Headers
    text = text.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>');
    
    // Convert # Headers
    text = text.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-10 mb-5">$1</h1>');
    
    // Convert links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline underline-offset-2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    return text;
  };

  return (
    <div className={`prose prose-sm max-w-none leading-relaxed ${className}`}>
      <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
      
      {/* Render database polls */}
      {polls.length > 0 && (
        <div className="space-y-4 mt-4">
          {polls.map(poll => (
            <PollComponent key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarkdownRenderer;
