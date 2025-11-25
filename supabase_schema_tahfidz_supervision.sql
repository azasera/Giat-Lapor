-- ============================================
-- SUPERVISI GURU TAHFIDZ - DATABASE SCHEMA
-- ============================================
-- URUTAN PEMBUATAN TABEL SUDAH DIPERBAIKI
-- ============================================

-- Tabel 1: tahfidz_supervisions (DIBUAT DULU)
-- Data utama supervisi guru tahfidz
CREATE TABLE IF NOT EXISTS public.tahfidz_supervisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_name text NOT NULL,
  supervision_date date NOT NULL,
  period text NOT NULL,
  year text NOT NULL,
  status text DEFAULT 'draft'::text NOT NULL, -- draft, submitted, approved
  total_score numeric DEFAULT 0,
  max_score numeric DEFAULT 230, -- 46 indikator × 5
  percentage numeric DEFAULT 0,
  category text, -- Mumtaz, Jayyid Jiddan, Jayyid, Maqbul, Dha'if
  notes text,
  recommendations text,
  strengths text,
  weaknesses text,
  action_plan text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone
);

-- Tabel 2: tahfidz_supervision_items
-- Detail penilaian per indikator
CREATE TABLE IF NOT EXISTS public.tahfidz_supervision_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supervision_id uuid REFERENCES public.tahfidz_supervisions(id) ON DELETE CASCADE NOT NULL,
  category_number integer NOT NULL,
  category_name text NOT NULL,
  indicator_number integer NOT NULL,
  indicator_text text NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabel 3: tahfidz_supervision_schedules
-- Untuk penjadwalan supervisi guru tahfidz
CREATE TABLE IF NOT EXISTS public.tahfidz_supervision_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_name text NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time,
  status text DEFAULT 'scheduled'::text NOT NULL, -- scheduled, completed, cancelled, rescheduled
  focus_areas text[], -- Area yang akan difokuskan
  notes text,
  reminder_sent boolean DEFAULT false,
  supervision_id uuid REFERENCES public.tahfidz_supervisions(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabel 4: foundation_tahfidz_reports
-- Laporan ke yayasan
CREATE TABLE IF NOT EXISTS public.foundation_tahfidz_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period text NOT NULL,
  year text NOT NULL,
  report_type text NOT NULL, -- monthly, semester, annual
  total_teachers integer DEFAULT 0,
  average_score numeric DEFAULT 0,
  summary_data jsonb,
  recommendations text,
  action_plan text,
  strengths text,
  weaknesses text,
  status text DEFAULT 'draft'::text NOT NULL, -- draft, submitted, reviewed, approved
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  submitted_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamp with time zone,
  review_notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabel 5: tahfidz_certificates
-- Sertifikat digital untuk guru berprestasi
CREATE TABLE IF NOT EXISTS public.tahfidz_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supervision_id uuid REFERENCES public.tahfidz_supervisions(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_name text NOT NULL,
  certificate_number text UNIQUE NOT NULL,
  category text NOT NULL, -- Mumtaz, Jayyid Jiddan
  score numeric NOT NULL,
  period text NOT NULL,
  year text NOT NULL,
  issued_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  issued_at timestamp with time zone DEFAULT now() NOT NULL,
  qr_code text,
  verification_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabel 6: tahfidz_targets
-- Target skor untuk institusi dan individual
CREATE TABLE IF NOT EXISTS public.tahfidz_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL, -- institutional, individual
  teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_name text,
  period text NOT NULL,
  year text NOT NULL,
  category_targets jsonb, -- Target per kategori
  overall_target numeric NOT NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.tahfidz_supervisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tahfidz_supervision_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tahfidz_supervision_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foundation_tahfidz_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tahfidz_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tahfidz_targets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - tahfidz_supervisions
-- ============================================

CREATE POLICY "Users can view their own supervisions"
  ON public.tahfidz_supervisions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = teacher_id);

CREATE POLICY "Foundation can view all supervisions"
  ON public.tahfidz_supervisions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'foundation'
  ));

CREATE POLICY "Admin can view all supervisions"
  ON public.tahfidz_supervisions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can insert their own supervisions"
  ON public.tahfidz_supervisions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supervisions"
  ON public.tahfidz_supervisions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update all supervisions"
  ON public.tahfidz_supervisions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can delete their own supervisions"
  ON public.tahfidz_supervisions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can delete all supervisions"
  ON public.tahfidz_supervisions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- RLS POLICIES - tahfidz_supervision_items
-- ============================================

CREATE POLICY "Users can view their own supervision items"
  ON public.tahfidz_supervision_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tahfidz_supervisions 
    WHERE id = supervision_id AND (user_id = auth.uid() OR teacher_id = auth.uid())
  ));

CREATE POLICY "Foundation can view all supervision items"
  ON public.tahfidz_supervision_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'foundation'
  ));

CREATE POLICY "Admin can view all supervision items"
  ON public.tahfidz_supervision_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can insert their own supervision items"
  ON public.tahfidz_supervision_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tahfidz_supervisions 
    WHERE id = supervision_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own supervision items"
  ON public.tahfidz_supervision_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.tahfidz_supervisions 
    WHERE id = supervision_id AND user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tahfidz_supervisions 
    WHERE id = supervision_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admin can update all supervision items"
  ON public.tahfidz_supervision_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can delete their own supervision items"
  ON public.tahfidz_supervision_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.tahfidz_supervisions 
    WHERE id = supervision_id AND user_id = auth.uid()
  ));

CREATE POLICY "Admin can delete all supervision items"
  ON public.tahfidz_supervision_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- RLS POLICIES - tahfidz_supervision_schedules
-- ============================================

CREATE POLICY "Users can view their own schedules"
  ON public.tahfidz_supervision_schedules FOR SELECT
  USING (auth.uid() = supervisor_id OR auth.uid() = teacher_id);

CREATE POLICY "Foundation can view all schedules"
  ON public.tahfidz_supervision_schedules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'foundation'
  ));

CREATE POLICY "Admin can view all schedules"
  ON public.tahfidz_supervision_schedules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can insert their own schedules"
  ON public.tahfidz_supervision_schedules FOR INSERT
  WITH CHECK (auth.uid() = supervisor_id);

CREATE POLICY "Users can update their own schedules"
  ON public.tahfidz_supervision_schedules FOR UPDATE
  USING (auth.uid() = supervisor_id)
  WITH CHECK (auth.uid() = supervisor_id);

CREATE POLICY "Admin can update all schedules"
  ON public.tahfidz_supervision_schedules FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can delete their own schedules"
  ON public.tahfidz_supervision_schedules FOR DELETE
  USING (auth.uid() = supervisor_id);

CREATE POLICY "Admin can delete all schedules"
  ON public.tahfidz_supervision_schedules FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- RLS POLICIES - foundation_tahfidz_reports
-- ============================================

CREATE POLICY "Principal can view all reports"
  ON public.foundation_tahfidz_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  ));

CREATE POLICY "Foundation can view all reports"
  ON public.foundation_tahfidz_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'foundation'
  ));

CREATE POLICY "Admin can view all reports"
  ON public.foundation_tahfidz_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Principal can insert reports"
  ON public.foundation_tahfidz_reports FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  ));

CREATE POLICY "Principal can update their reports"
  ON public.foundation_tahfidz_reports FOR UPDATE
  USING (auth.uid() = submitted_by)
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Foundation can update reports"
  ON public.foundation_tahfidz_reports FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'foundation'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'foundation'
  ));

CREATE POLICY "Admin can update all reports"
  ON public.foundation_tahfidz_reports FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin can delete all reports"
  ON public.foundation_tahfidz_reports FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- RLS POLICIES - tahfidz_certificates
-- ============================================

CREATE POLICY "Users can view their own certificates"
  ON public.tahfidz_certificates FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Principal can view all certificates"
  ON public.tahfidz_certificates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  ));

CREATE POLICY "Foundation can view all certificates"
  ON public.tahfidz_certificates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'foundation'
  ));

CREATE POLICY "Admin can view all certificates"
  ON public.tahfidz_certificates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Principal can insert certificates"
  ON public.tahfidz_certificates FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  ));

CREATE POLICY "Admin can insert certificates"
  ON public.tahfidz_certificates FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin can delete all certificates"
  ON public.tahfidz_certificates FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- RLS POLICIES - tahfidz_targets
-- ============================================

CREATE POLICY "Users can view their own targets"
  ON public.tahfidz_targets FOR SELECT
  USING (auth.uid() = teacher_id OR target_type = 'institutional');

CREATE POLICY "Principal can view all targets"
  ON public.tahfidz_targets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  ));

CREATE POLICY "Foundation can view all targets"
  ON public.tahfidz_targets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'foundation'
  ));

CREATE POLICY "Admin can view all targets"
  ON public.tahfidz_targets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Principal can insert targets"
  ON public.tahfidz_targets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  ));

CREATE POLICY "Principal can update targets"
  ON public.tahfidz_targets FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'principal'
  ));

CREATE POLICY "Admin can update all targets"
  ON public.tahfidz_targets FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin can delete all targets"
  ON public.tahfidz_targets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_tahfidz_supervisions_updated_at
BEFORE UPDATE ON public.tahfidz_supervisions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tahfidz_supervision_items_updated_at
BEFORE UPDATE ON public.tahfidz_supervision_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tahfidz_supervision_schedules_updated_at
BEFORE UPDATE ON public.tahfidz_supervision_schedules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foundation_tahfidz_reports_updated_at
BEFORE UPDATE ON public.foundation_tahfidz_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tahfidz_targets_updated_at
BEFORE UPDATE ON public.tahfidz_targets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INDEXES untuk performa
-- ============================================

CREATE INDEX idx_tahfidz_supervisions_user ON public.tahfidz_supervisions(user_id);
CREATE INDEX idx_tahfidz_supervisions_teacher ON public.tahfidz_supervisions(teacher_id);
CREATE INDEX idx_tahfidz_supervisions_date ON public.tahfidz_supervisions(supervision_date);
CREATE INDEX idx_tahfidz_supervisions_period ON public.tahfidz_supervisions(period, year);

CREATE INDEX idx_tahfidz_supervision_items_supervision ON public.tahfidz_supervision_items(supervision_id);

CREATE INDEX idx_tahfidz_supervision_schedules_supervisor ON public.tahfidz_supervision_schedules(supervisor_id);
CREATE INDEX idx_tahfidz_supervision_schedules_teacher ON public.tahfidz_supervision_schedules(teacher_id);
CREATE INDEX idx_tahfidz_supervision_schedules_date ON public.tahfidz_supervision_schedules(scheduled_date);
CREATE INDEX idx_tahfidz_supervision_schedules_status ON public.tahfidz_supervision_schedules(status);

CREATE INDEX idx_foundation_tahfidz_reports_period ON public.foundation_tahfidz_reports(period, year);
CREATE INDEX idx_foundation_tahfidz_reports_status ON public.foundation_tahfidz_reports(status);

CREATE INDEX idx_tahfidz_certificates_teacher ON public.tahfidz_certificates(teacher_id);
CREATE INDEX idx_tahfidz_certificates_supervision ON public.tahfidz_certificates(supervision_id);

CREATE INDEX idx_tahfidz_targets_teacher ON public.tahfidz_targets(teacher_id);
CREATE INDEX idx_tahfidz_targets_period ON public.tahfidz_targets(period, year);
