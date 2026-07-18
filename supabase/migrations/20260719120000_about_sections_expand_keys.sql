-- Widen the About page section_key CHECK constraint so the CMS can hold
-- rows for the new hard-coded sections (stats, timeline, awards,
-- expertise) once we're ready to move that copy from code into DB.
-- Existing rows keep their keys and remain valid.

ALTER TABLE about_page_sections
  DROP CONSTRAINT IF EXISTS about_page_sections_section_key_check;

ALTER TABLE about_page_sections
  ADD CONSTRAINT about_page_sections_section_key_check
    CHECK (section_key IN (
      'history', 'founder', 'mission',
      'awards', 'timeline', 'stats', 'expertise'
    ));
