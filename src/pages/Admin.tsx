import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  post_id: string;
  reason: string;
  status: string;
  created_at: string;
  posts: {
    title: string;
    author_id: string;
  };
  profiles: {
    username: string;
  };
}

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

const Admin = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRoles();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/');
      return;
    }

    loadData();
  }, [user, isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, requestsRes] = await Promise.all([
        supabase
          .from('post_reports')
          .select(`
            *,
            posts(title, author_id),
            profiles!post_reports_reporter_id_fkey(username)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('feature_requests')
          .select('*, profiles(username)')
          .order('created_at', { ascending: false })
      ]);

      if (reportsRes.data) setReports(reportsRes.data as any);
      if (requestsRes.data) setFeatureRequests(requestsRes.data as any);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({ title: 'Post gelöscht' });
      loadData();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({ title: 'Fehler', description: 'Post konnte nicht gelöscht werden', variant: 'destructive' });
    }
  };

  const handleReportAction = async (reportId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('post_reports')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({ title: status === 'approved' ? 'Meldung akzeptiert' : 'Meldung abgelehnt' });
      loadData();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({ title: 'Fehler', variant: 'destructive' });
    }
  };

  const handleFeatureRequestUpdate = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('feature_requests')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({ title: 'Status aktualisiert' });
      loadData();
    } catch (error) {
      console.error('Error updating feature request:', error);
      toast({ title: 'Fehler', variant: 'destructive' });
    }
  };

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="pt-20 max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8">Admin Bereich</h1>

        <Tabs defaultValue="reports">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">Meldungen</TabsTrigger>
            <TabsTrigger value="features">Feature Anfragen</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4 mt-6">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Keine Meldungen vorhanden
                </CardContent>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{report.posts?.title}</span>
                      <Badge variant={
                        report.status === 'pending' ? 'secondary' :
                        report.status === 'approved' ? 'default' : 'destructive'
                      }>
                        {report.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Gemeldet von: {report.profiles?.username}</p>
                      <p className="text-sm font-medium mt-2">Grund: {report.reason}</p>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePost(report.post_id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Post löschen
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleReportAction(report.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Akzeptieren
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction(report.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Ablehnen
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="features" className="space-y-4 mt-6">
            {featureRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Keine Feature Anfragen vorhanden
                </CardContent>
              </Card>
            ) : (
              featureRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{request.title}</span>
                      <Badge variant={
                        request.status === 'pending' ? 'secondary' :
                        request.status === 'in_progress' ? 'default' :
                        request.status === 'completed' ? 'default' : 'destructive'
                      }>
                        {request.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Von: {request.profiles?.username}</p>
                      <p className="text-sm mt-2">{request.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFeatureRequestUpdate(request.id, 'in_progress')}
                      >
                        In Bearbeitung
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleFeatureRequestUpdate(request.id, 'completed')}
                      >
                        Abgeschlossen
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleFeatureRequestUpdate(request.id, 'rejected')}
                      >
                        Ablehnen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Admin;
