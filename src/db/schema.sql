-- Create URL lists table
CREATE TABLE IF NOT EXISTS url_lists (
    id SERIAL PRIMARY KEY,
    custom_url TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create URLs table
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    list_id INTEGER REFERENCES url_lists(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups by custom_url
CREATE INDEX IF NOT EXISTS idx_url_lists_custom_url ON url_lists(custom_url);

-- Create index for list_id to speed up URL lookups within a list
CREATE INDEX IF NOT EXISTS idx_urls_list_id ON urls(list_id);