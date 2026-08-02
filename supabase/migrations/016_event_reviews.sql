-- 016_event_reviews.sql

-- Enable uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create event_reviews table
CREATE TABLE IF NOT EXISTS event_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL CHECK (length(review_text) >= 10 AND length(review_text) <= 500),
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Prevent duplicate reviews per user per event
    CONSTRAINT unique_event_user_review UNIQUE (event_id, user_id)
);

-- Note: We use references users(id) instead of auth.users because we query user details from users

-- Add indexes for fast lookup and aggregates
CREATE INDEX IF NOT EXISTS idx_reviews_event_id ON event_reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON event_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON event_reviews(is_approved);

-- Enable RLS
ALTER TABLE event_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public can read approved reviews
CREATE POLICY "Public can view approved reviews"
    ON event_reviews FOR SELECT
    USING (is_approved = true);

-- Authenticated users can read their own reviews (even if not approved yet)
CREATE POLICY "Users can view their own reviews"
    ON event_reviews FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
    ON event_reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );



-- Only Authenticated users can insert their own reviews
CREATE POLICY "Authenticad users can create reviews"
    ON event_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can update reviews (approve/reject)
CREATE POLICY "Admins can update reviews"
    ON event_reviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );



-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
    ON event_reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can delete any review
CREATE POLICY "Admins can delete any review"
    ON event_reviews FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_event_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_reviews_timestamp
    BEFORE UPDATE ON event_reviews
    FOR EACH ROW
    EXECUTE PROCEDURE update_event_reviews_updated_at();
