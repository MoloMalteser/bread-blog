-- Add more daily missions for variety and engagement (using UUID IDs)
INSERT INTO public.daily_missions (title, description, mission_type, target_count, reward_points, is_active) VALUES
  ('Interaktion meistern', 'Kommentiere 5 Posts von anderen Nutzern', 'comment', 5, 50, true),
  ('Wissensdurst stillen', 'Lese 10 verschiedene Artikel vollständig', 'read_article', 10, 30, true),
  ('Netzwerk erweitern', 'Folge 3 neuen Nutzern', 'follow_user', 3, 40, true),
  ('Kreativität entfalten', 'Verwende eine Umfrage in einem Post', 'create_poll', 1, 60, true),
  ('Bildgeschichten erzählen', 'Lade 2 Bilder in Posts hoch', 'upload_image', 2, 35, true),
  ('Soziales Genie', 'Erhalte 10 Likes auf deinen Posts', 'receive_likes', 10, 70, true),
  ('Täglicher Schreiber', 'Schreibe 500 Wörter in Posts', 'write_words', 500, 80, true),
  ('Sprachbrücke', 'Übersetze 2 Artikel mit BreadGPT', 'translate_article', 2, 45, true),
  ('Themen-Entdecker', 'Erstelle Posts zu 3 verschiedenen Kategorien', 'diverse_topics', 3, 55, true),
  ('Community-Helfer', 'Hilf anderen mit 3 hilfreichen Kommentaren', 'helpful_comments', 3, 50, true);