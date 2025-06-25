export interface Announcement {
    id?: number; // or announcement_id if your API returns that key
    admin_id?: number; // optional, if you need to know which admin posted it
    title: string;
    type: 'text' | 'image' | 'video'; // if these are your only allowed types
    content: string; // For text announcements this may be a JSON string; for media, it could be a URL
    description?: string; // Optional additional description or caption
    published_at?: string; // ISO date string or null if not yet published
    created_at?: string; // ISO date string
    updated_at?: string; // ISO date string
  }
  