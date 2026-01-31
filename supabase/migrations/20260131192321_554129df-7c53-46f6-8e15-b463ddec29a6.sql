-- Update the digital-library bucket to allow files up to 100MB (104857600 bytes)
UPDATE storage.buckets 
SET file_size_limit = 104857600 
WHERE id = 'digital-library';