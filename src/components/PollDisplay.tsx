import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePolls, Poll } from "@/hooks/usePolls";
import { useLanguage } from "@/hooks/useLanguage";

interface PollDisplayProps {
  postId: string;
}

export const PollDisplay = ({ postId }: PollDisplayProps) => {
  const { getPollsForPost, voteOnPoll, getPollResults, hasUserVoted } = usePolls();
  const { t } = useLanguage();
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    loadPolls();
  }, [postId]);

  const loadPolls = async () => {
    const data = await getPollsForPost(postId);
    setPolls(data);
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    const success = await voteOnPoll(pollId, optionIndex);
    if (success) {
      await loadPolls();
    }
  };

  if (polls.length === 0) return null;

  return (
    <div className="space-y-4 mt-4">
      {polls.map((poll) => {
        const results = getPollResults(poll);
        const userVote = hasUserVoted(poll);
        const hasVoted = userVote !== null;

        return (
          <Card key={poll.id} className="p-4">
            <h4 className="font-semibold mb-3">{poll.title}</h4>
            <div className="space-y-2">
              {poll.options.map((option, index) => {
                const percentage = results.percentages[index] || 0;
                const count = results.optionCounts[index] || 0;
                const isSelected = userVote === index;

                return (
                  <div key={index}>
                    {hasVoted ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className={isSelected ? "font-semibold" : ""}>
                            {option}
                          </span>
                          <span className="text-muted-foreground">
                            {count} {count === 1 ? t('vote') : t('votes')} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleVote(poll.id, index)}
                      >
                        {option}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-sm text-muted-foreground mt-3">
              {t('totalVotes')}: {results.totalVotes}
            </div>
          </Card>
        );
      })}
    </div>
  );
};
