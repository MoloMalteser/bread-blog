-- Add more daily missions using valid mission types
INSERT INTO public.daily_missions (title, description, mission_type, target_count, reward_points, is_active) VALUES
  ('Kommentar-Meister', 'Schreibe 5 hilfreiche Kommentare zu Posts', 'comment', 5, 50, true),
  ('Artikel-Liebhaber', 'Gib 8 Likes für interessante Posts', 'like', 8, 40, true),
  ('Kreativer Schreiber', 'Verfasse 2 neue Posts heute', 'post', 2, 60, true),
  ('BreadGPT Enthusiast', 'Stelle 3 interessante Fragen an BreadGPT', 'breadgpt_ask', 3, 35, true),
  ('Wiki-Kontributor', 'Bearbeite 2 Wiki-Seiten', 'wiki_edit', 2, 55, true),
  ('Künstlerischer Geist', 'Erstelle 1 Zeichnung im DrawPage', 'draw', 1, 45, true),
  ('Soziale Interaktion', 'Hinterlasse 10 Likes und 3 Kommentare', 'comment', 3, 70, true),
  ('Täglicher Blogger', 'Schreibe mindestens 3 Posts', 'post', 3, 80, true),
  ('Wissenssammler', 'Stelle 5 verschiedene Fragen an BreadGPT', 'breadgpt_ask', 5, 65, true),
  ('Community Builder', 'Gib 15 Likes und kommentiere 5 Posts', 'like', 15, 90, true);