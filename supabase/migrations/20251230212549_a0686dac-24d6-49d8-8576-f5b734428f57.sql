-- Update the document title to the correct one
UPDATE public.content
SET 
  title = 'مطالب الشعب المغربي',
  slug = 'matalib-al-shaab-al-maghribi',
  excerpt = 'وثيقة تاريخية من مجموعة المكتبة الوطنية للمملكة المغربية',
  updated_at = NOW()
WHERE file_url = '/documents/A-52675_compressed.pdf';