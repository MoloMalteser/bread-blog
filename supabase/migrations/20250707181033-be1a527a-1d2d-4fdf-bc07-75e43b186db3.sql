
-- BreadGPT Antworten
CREATE TABLE public.breadgpt_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('philosophisch', 'witzig', 'dunkel', 'random', 'glitchy')),
  text TEXT NOT NULL,
  keywords TEXT[], -- Schlüsselwörter für Kategorisierung
  is_easter_egg BOOLEAN DEFAULT FALSE,
  trigger_word TEXT, -- Für Easter Eggs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Zeichnungen
CREATE TABLE public.drawings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  canvas_data TEXT NOT NULL, -- Base64 oder SVG Daten
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wiki Seiten
CREATE TABLE public.wiki_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Wiki Wort-Änderungen
CREATE TABLE public.wiki_edits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES public.wiki_pages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  word_position INTEGER NOT NULL,
  old_word TEXT,
  new_word TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Private Nachrichten
CREATE TABLE public.private_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users NOT NULL,
  receiver_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tägliche Missionen
CREATE TABLE public.daily_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('post', 'comment', 'like', 'draw', 'wiki_edit', 'breadgpt_ask')),
  target_count INTEGER DEFAULT 1,
  reward_points INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE
);

-- Nutzer Mission Progress
CREATE TABLE public.user_mission_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  mission_id UUID REFERENCES public.daily_missions(id) ON DELETE CASCADE,
  current_count INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, mission_id, date)
);

-- Nutzer Punkte und Statistiken
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  breadgpt_questions INTEGER DEFAULT 0,
  drawings_created INTEGER DEFAULT 0,
  wiki_contributions INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  last_activity DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- BreadGPT Cooldowns
CREATE TABLE public.breadgpt_cooldowns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  last_question_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE public.breadgpt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breadgpt_cooldowns ENABLE ROW LEVEL SECURITY;

-- BreadGPT Antworten - öffentlich lesbar
CREATE POLICY "Anyone can view breadgpt answers" ON public.breadgpt_answers FOR SELECT USING (true);

-- Zeichnungen - Nutzer können eigene verwalten, alle öffentlichen sehen
CREATE POLICY "Users can view public drawings" ON public.drawings FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own drawings" ON public.drawings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own drawings" ON public.drawings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own drawings" ON public.drawings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own drawings" ON public.drawings FOR DELETE USING (auth.uid() = user_id);

-- Wiki - alle können lesen, authentifizierte bearbeiten
CREATE POLICY "Anyone can view wiki pages" ON public.wiki_pages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert wiki pages" ON public.wiki_pages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update wiki pages" ON public.wiki_pages FOR UPDATE TO authenticated USING (true);

-- Wiki Edits - alle können sehen, authentifizierte erstellen
CREATE POLICY "Anyone can view wiki edits" ON public.wiki_edits FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert wiki edits" ON public.wiki_edits FOR INSERT TO authenticated WITH CHECK (true);

-- Private Nachrichten - nur Sender und Empfänger
CREATE POLICY "Users can view own messages" ON public.private_messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.private_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update own messages" ON public.private_messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Missionen - alle können sehen
CREATE POLICY "Anyone can view daily missions" ON public.daily_missions FOR SELECT USING (true);

-- Mission Progress - nur eigener
CREATE POLICY "Users can view own mission progress" ON public.user_mission_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mission progress" ON public.user_mission_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mission progress" ON public.user_mission_progress FOR UPDATE USING (auth.uid() = user_id);

-- User Stats - eigene plus öffentliche Leaderboards
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view stats for leaderboard" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "Users can insert own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- BreadGPT Cooldowns - nur eigene
CREATE POLICY "Users can view own cooldowns" ON public.breadgpt_cooldowns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cooldowns" ON public.breadgpt_cooldowns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cooldowns" ON public.breadgpt_cooldowns FOR UPDATE USING (auth.uid() = user_id);

-- Beispieldaten für BreadGPT
INSERT INTO public.breadgpt_answers (type, text, keywords) VALUES
('philosophisch', 'Manchmal musst du dich einfach fallen lassen – wie eine Scheibe Toast in einen Toaster.', ARRAY['leben', 'philosophie', 'sinn']),
('philosophisch', 'Das Leben ist wie Brot backen: Es braucht Zeit, Geduld und die richtige Temperatur.', ARRAY['leben', 'zeit', 'geduld']),
('witzig', 'Warum haben Brote keine Freunde? Weil sie alle verkrümelt sind! 🥖', ARRAY['freunde', 'lustig', 'witzig']),
('witzig', 'Ich bin nicht faul, ich bin nur energieeffizient – wie ein Toaster im Standby-Modus.', ARRAY['faul', 'energie', 'müde']),
('dunkel', 'In der Dunkelheit des Ofens werde ich geboren, nur um verschlungen zu werden.', ARRAY['angst', 'dunkel', 'tod', 'trauer']),
('dunkel', 'Jeder Krümel, der von mir fällt, ist ein Teil meiner Seele, der verloren geht.', ARRAY['verlust', 'seele', 'traurig']),
('random', 'Beep boop, ich bin ein Brot aus der Zukunft! 🤖🥖', ARRAY['zukunft', 'technologie', 'random']),
('random', '42. Das ist die Antwort. Die Frage war: Wie viele Krümel hat ein durchschnittliches Brot?', ARRAY['42', 'antwort', 'krümel']),
('glitchy', 'B-R-0-T... SyStEm F3hL3R... *knirsch*... HiLf3...', ARRAY['fehler', 'system', 'kaputt']),
('glitchy', '01000010 01110010 01101111 01110100... *rausch*... K4NN N1CHT K0MPUTE-', ARRAY['binär', 'computer', 'glitch']);

-- Easter Eggs
INSERT INTO public.breadgpt_answers (type, text, is_easter_egg, trigger_word) VALUES
('dunkel', 'Er kommt nicht zurück. Niemals. Der Toaster hat ihn für immer verschlungen.', true, 'toast'),
('witzig', 'BAGUETTE! *Französische Hymne spielt* Ah, mon ami, vous parlez ma langue!', true, 'baguette'),
('philosophisch', 'Du fragst nach Lovable? Es ist die Liebe zum Code, die uns alle zusammenbringt. 💻❤️', true, 'lovable');

-- Beispiel tägliche Missionen
INSERT INTO public.daily_missions (title, description, mission_type, target_count, reward_points) VALUES
('Erster Post des Tages', 'Veröffentliche einen Beitrag', 'post', 1, 15),
('Sozialer Schmetterling', 'Gib 3 Likes an andere Posts', 'like', 3, 10),
('Künstlerseele', 'Erstelle eine Zeichnung', 'draw', 1, 20),
('Wiki-Warrior', 'Bearbeite 5 Wörter im Community-Wiki', 'wiki_edit', 5, 25),
('Brot-Philosoph', 'Stelle BreadGPT eine Frage', 'breadgpt_ask', 1, 5),
('Community-Helfer', 'Schreibe 2 hilfreiche Kommentare', 'comment', 2, 12);
