import React, { useEffect, useState } from 'react';
import { usePolls, Poll } from '@/hooks/usePolls';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/hooks/useLanguage';

interface RichContentRendererProps {
  content: string;
  postId?: string;
  className?: string;
}

const RichContentRenderer: React.FC<RichContentRendererProps> = ({ content, postId, className = '' }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const { getPollsForPost, voteOnPoll, getPollResults, hasUserVoted } = usePolls();
  const { t } = useLanguage();

  useEffect(() => {
    if (postId) {
      getPollsForPost(postId).then(setPolls);
    }
  }, [postId]);

  const handleVote = async (pollId: string, optionIndex: number) => {
    const success = await voteOnPoll(pollId, optionIndex);
    if (success && postId) {
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
                        <span>{votes} {votes !== 1 ? t('votes') || 'votes' : t('vote') || 'vote'}</span>
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
            {t('totalVotes') || 'Total'} {results.totalVotes} {results.totalVotes !== 1 ? t('votes') || 'votes' : t('vote') || 'vote'}
          </div>
        )}
      </Card>
    );
  };

  // Parse content and convert markdown-like syntax to real HTML
  const parseContent = (text: string) => {
    const elements: JSX.Element[] = [];
    let currentIndex = 0;

    // Split by double newlines for paragraphs
    const blocks = text.split('\n\n');

    blocks.forEach((block, blockIndex) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return;

      // Check for headers
      if (trimmedBlock.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${blockIndex}`} className="text-2xl font-bold mt-8 mb-4">
            {parseInline(trimmedBlock.substring(2))}
          </h1>
        );
      } else if (trimmedBlock.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${blockIndex}`} className="text-xl font-semibold mt-6 mb-3">
            {parseInline(trimmedBlock.substring(3))}
          </h2>
        );
      } else if (trimmedBlock.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${blockIndex}`} className="text-lg font-semibold mt-4 mb-2">
            {parseInline(trimmedBlock.substring(4))}
          </h3>
        );
      } 
      // Check for images
      else if (trimmedBlock.match(/!\[([^\]]*)\]\(([^)]+)\)/)) {
        const match = trimmedBlock.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (match) {
          elements.push(
            <img
              key={`img-${blockIndex}`}
              src={match[2]}
              alt={match[1]}
              className="max-w-full h-auto rounded-xl my-4 shadow-lg border border-border"
              loading="lazy"
            />
          );
        }
      } 
      // Regular paragraph
      else {
        elements.push(
          <p key={`p-${blockIndex}`} className="mb-4 leading-relaxed">
            {parseInline(trimmedBlock)}
          </p>
        );
      }
    });

    return elements;
  };

  // Parse inline formatting (bold, italic, etc.)
  const parseInline = (text: string): (string | JSX.Element)[] => {
    const elements: (string | JSX.Element)[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold **text**
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          elements.push(remaining.substring(0, boldMatch.index));
        }
        elements.push(
          <strong key={`bold-${key++}`} className="font-bold">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // Italic *text*
      const italicMatch = remaining.match(/\*([^*]+)\*/);
      if (italicMatch && italicMatch.index !== undefined) {
        if (italicMatch.index > 0) {
          elements.push(remaining.substring(0, italicMatch.index));
        }
        elements.push(
          <em key={`italic-${key++}`} className="italic">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
        continue;
      }

      // Code `text`
      const codeMatch = remaining.match(/`([^`]+)`/);
      if (codeMatch && codeMatch.index !== undefined) {
        if (codeMatch.index > 0) {
          elements.push(remaining.substring(0, codeMatch.index));
        }
        elements.push(
          <code key={`code-${key++}`} className="bg-muted px-2 py-1 rounded text-sm font-mono">
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.substring(codeMatch.index + codeMatch[0].length);
        continue;
      }

      // Link [text](url)
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch && linkMatch.index !== undefined) {
        if (linkMatch.index > 0) {
          elements.push(remaining.substring(0, linkMatch.index));
        }
        elements.push(
          <a
            key={`link-${key++}`}
            href={linkMatch[2]}
            className="text-primary hover:underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.substring(linkMatch.index + linkMatch[0].length);
        continue;
      }

      // No more matches, add remaining text
      elements.push(remaining);
      break;
    }

    return elements;
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {parseContent(content)}
      
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

export default RichContentRenderer;
