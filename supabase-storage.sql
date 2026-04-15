-- ============================================
-- SUPABASE STORAGE BUCKETS
-- Run this in Supabase SQL Editor
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('pet-images', 'pet-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('store-images', 'store-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('shelter-images', 'shelter-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('lost-found-images', 'lost-found-images', true);

-- RLS Policies for pet-images bucket
CREATE POLICY "Anyone can view pet images" ON storage.objects FOR SELECT USING (bucket_id = 'pet-images');
CREATE POLICY "Authenticated users can upload pet images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pet-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own pet images" ON storage.objects FOR UPDATE USING (bucket_id = 'pet-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own pet images" ON storage.objects FOR DELETE USING (bucket_id = 'pet-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS Policies for avatars bucket
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS Policies for store-images bucket
CREATE POLICY "Anyone can view store images" ON storage.objects FOR SELECT USING (bucket_id = 'store-images');
CREATE POLICY "Authenticated users can upload store images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'store-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own store images" ON storage.objects FOR UPDATE USING (bucket_id = 'store-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own store images" ON storage.objects FOR DELETE USING (bucket_id = 'store-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS Policies for product-images bucket
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own product images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own product images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS Policies for shelter-images bucket
CREATE POLICY "Anyone can view shelter images" ON storage.objects FOR SELECT USING (bucket_id = 'shelter-images');
CREATE POLICY "Authenticated users can upload shelter images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shelter-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own shelter images" ON storage.objects FOR UPDATE USING (bucket_id = 'shelter-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own shelter images" ON storage.objects FOR DELETE USING (bucket_id = 'shelter-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS Policies for lost-found-images bucket
CREATE POLICY "Anyone can view lost found images" ON storage.objects FOR SELECT USING (bucket_id = 'lost-found-images');
CREATE POLICY "Authenticated users can upload lost found images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lost-found-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own lost found images" ON storage.objects FOR UPDATE USING (bucket_id = 'lost-found-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own lost found images" ON storage.objects FOR DELETE USING (bucket_id = 'lost-found-images' AND auth.uid()::text = (storage.foldername(name))[1]);
