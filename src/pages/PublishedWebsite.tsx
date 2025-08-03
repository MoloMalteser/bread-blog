import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const PublishedWebsite = () => {
  const { slug } = useParams();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchWebsite = async () => {
      if (!slug) {
        setError('Kein Slug gefunden');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('websites')
          .select('html_content, title')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error) {
          console.error('Error fetching website:', error);
          setError('Website nicht gefunden oder nicht veröffentlicht');
          setLoading(false);
          return;
        }

        if (data && data.html_content) {
          setHtmlContent(data.html_content);
        } else {
          setError('Website hat keinen Inhalt');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Fehler beim Laden der Website');
      } finally {
        setLoading(false);
      }
    };

    fetchWebsite();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Website wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Website nicht gefunden</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a 
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🍞 Zur Startseite
          </a>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default PublishedWebsite;