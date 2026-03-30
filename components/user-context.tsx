"use client";

import { createContext, useContext } from "react";

type UserContextValue = {
    role: string | null;
    userId: string;
    displayName: string;
    email: string;
};

const UserContext = createContext<UserContextValue>({
    role: null,
    userId: "",
    displayName: "",
    email: "",
});

export function UserProvider({
    role,
    userId,
    displayName,
    email,
    children,
}: UserContextValue & { children: React.ReactNode }) {
    return (
        <UserContext.Provider value={{ role, userId, displayName, email }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
