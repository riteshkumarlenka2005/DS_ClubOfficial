import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
    name: string;
    email: string;
    year: string;
    branch: string;
    phone: string;
}

interface UserContextType {
    profile: UserProfile | null;
    setProfile: (profile: UserProfile | null) => void;
    registrations: number[];
    registerForEvent: (eventId: number) => void;
    isRegistered: (eventId: number) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const PROFILE_KEY = 'dsclub_profile';
const REG_KEY = 'dsclub_registrations';

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [profile, setProfileState] = useState<UserProfile | null>(() => {
        try {
            const saved = localStorage.getItem(PROFILE_KEY);
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    const [registrations, setRegistrations] = useState<number[]>(() => {
        try {
            const saved = localStorage.getItem(REG_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    useEffect(() => {
        if (profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        else localStorage.removeItem(PROFILE_KEY);
    }, [profile]);

    useEffect(() => {
        localStorage.setItem(REG_KEY, JSON.stringify(registrations));
    }, [registrations]);

    const setProfile = (p: UserProfile | null) => setProfileState(p);

    const registerForEvent = (eventId: number) => {
        setRegistrations(prev => {
            if (prev.includes(eventId)) return prev;
            return [...prev, eventId];
        });
    };

    const isRegistered = (eventId: number) => registrations.includes(eventId);

    return (
        <UserContext.Provider value={{ profile, setProfile, registrations, registerForEvent, isRegistered }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within UserProvider');
    return ctx;
};

export default UserContext;
