export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    status: string;
}

export interface UserWithProfile {
    id: string;
    firstName: string;
    lastName: string;
    middleInitial: string;
    email: string;
    role: string;
    status: string;
    contactNumber: string;
    createdAt: string;
}
