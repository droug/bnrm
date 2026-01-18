-- Insert default mediatheque videos
INSERT INTO cms_mediatheque_videos (id, youtube_id, title_fr, title_ar, sort_order, is_active) VALUES
  (gen_random_uuid(), '2hOKleHBUYs', 'Visite guidée de la BNRM', 'جولة إرشادية في المكتبة الوطنية', 0, true),
  (gen_random_uuid(), 'l02BjttZjmE', 'Collections patrimoniales', 'المجموعات التراثية', 1, true),
  (gen_random_uuid(), 'LDGq_sRVSog', 'Manuscrits anciens', 'المخطوطات القديمة', 2, true),
  (gen_random_uuid(), '5vA8lzi8tCU', 'Activités culturelles', 'الأنشطة الثقافية', 3, true),
  (gen_random_uuid(), 'GjCFxTlnYac', 'Services numériques', 'الخدمات الرقمية', 4, true),
  (gen_random_uuid(), 'ILx_Ooc9TqA', 'Patrimoine marocain', 'التراث المغربي', 5, true)
ON CONFLICT DO NOTHING;