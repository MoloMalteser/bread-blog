-- Add more daily missions for variety and engagement
INSERT INTO public.daily_missions (id, title, description, type, target_count, points, is_active) VALUES
  ('mission_post_engagement_1', 'Interaktion meistern', 'Kommentiere 5 Posts von anderen Nutzern', 'comment', 5, 50, true),
  ('mission_article_reader_1', 'Wissensdurst stillen', 'Lese 10 verschiedene Artikel vollständig', 'read_article', 10, 30, true),
  ('mission_friend_maker_1', 'Netzwerk erweitern', 'Folge 3 neuen Nutzern', 'follow_user', 3, 40, true),
  ('mission_content_creator_1', 'Kreativität entfalten', 'Verwende eine Umfrage in einem Post', 'create_poll', 1, 60, true),
  ('mission_visual_storyteller_1', 'Bildgeschichten erzählen', 'Lade 2 Bilder in Posts hoch', 'upload_image', 2, 35, true),
  ('mission_social_butterfly_1', 'Soziales Genie', 'Erhalte 10 Likes auf deinen Posts', 'receive_likes', 10, 70, true),
  ('mission_daily_writer_1', 'Täglicher Schreiber', 'Schreibe 500 Wörter in Posts', 'write_words', 500, 80, true),
  ('mission_translator_1', 'Sprachbrücke', 'Übersetze 2 Artikel mit BreadGPT', 'translate_article', 2, 45, true),
  ('mission_topic_explorer_1', 'Themen-Entdecker', 'Erstelle Posts zu 3 verschiedenen Kategorien', 'diverse_topics', 3, 55, true),
  ('mission_community_helper_1', 'Community-Helfer', 'Hilf anderen mit 3 hilfreichen Kommentaren', 'helpful_comments', 3, 50, true)
ON CONFLICT (id) DO NOTHING;