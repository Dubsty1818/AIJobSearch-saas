ALTER TABLE public.job_matches 
ADD COLUMN matched_status TEXT DEFAULT NULL CHECK (matched_status IN ('approved', 'rejected', NULL)),
ADD COLUMN application_status TEXT DEFAULT NULL CHECK (application_status IN ('applied', 'rejected', 'ignored', 'interview', 'interview_2', 'offer', NULL)),
ADD COLUMN application_date TIMESTAMPTZ;
