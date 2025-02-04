export interface Profile {
    id: string;
    user_id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    updated_at: string;
}

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'id' | 'updated_at'>;
                Update: Partial<Omit<Profile, 'id'>>;
            };
        };
    };
}
