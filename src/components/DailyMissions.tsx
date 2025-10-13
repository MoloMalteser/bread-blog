
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, CheckCircle, Clock, Zap } from 'lucide-react';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { useToast } from '@/hooks/use-toast';

const DailyMissions = () => {
  const { missions, progress, loading, getMissionProgress, getCompletedMissions, getTotalPoints } = useDailyMissions();
  const { toast } = useToast();
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const points = await getTotalPoints();
        setTotalPoints(points);
      } catch (error) {
        console.error('Error fetching points:', error);
        setTotalPoints(0);
      }
    };
    fetchPoints();
  }, [getTotalPoints, progress]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading Missions...</p>
        </CardContent>
      </Card>
    );
  }

  const completedCount = getCompletedMissions();
  const totalMissions = missions.length || 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{completedCount}/{totalMissions}</div>
            <p className="text-sm text-muted-foreground">Missions Today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-sm text-muted-foreground">Total points</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">
              {totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Daily Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Missions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Daily Missions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {missions && missions.length > 0 ? missions.map((mission) => {
            const missionProgress = getMissionProgress(mission.id);
            const currentCount = missionProgress?.current_count || 0;
            const isCompleted = missionProgress?.completed_at !== null;
            const progressPercentage = Math.min((currentCount / (mission.target_count || 1)) * 100, 100);

            return (
              <div
                key={mission.id}
                className={`p-4 border rounded-lg transition-all ${
                  isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${isCompleted ? 'text-green-700' : ''}`}>
                        {mission.title}
                      </h3>
                      {isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {mission.description}
                    </p>
                  </div>
                  <Badge variant={isCompleted ? 'default' : 'secondary'}>
                    +{mission.reward_points || 0} Punkte
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Fortschritt: {currentCount}/{mission.target_count || 1}
                    </span>
                    <span className={`font-medium ${isCompleted ? 'text-green-600' : ''}`}>
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className={`h-2 ${isCompleted ? 'bg-green-100' : ''}`}
                  />
                </div>

                {isCompleted && missionProgress?.completed_at && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Finished at {new Date(missionProgress.completed_at).toLocaleTimeString('en-US')}</span>
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-medium mb-1">No Missions available</h3>
              <p className="text-sm text-muted-foreground">
                New Missions are added soon.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Motivational message */}
      {completedCount === totalMissions && totalMissions > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              All Missions completed! 🎉
            </h3>
            <p className="text-yellow-700">
              Fantastic! You successfully completed all the daily missions today.
Come back soon for new challenges!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyMissions;
