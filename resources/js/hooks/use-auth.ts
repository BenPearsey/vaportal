import { usePage } from "@inertiajs/react";
import { type User } from "@/types/user";

export function useAuth() {
    const { auth } = usePage<{ auth: { user: User } }>().props;

    // Safely extract first and last name based on the user's role
    const firstName = auth.user.admin?.firstname || auth.user.agent?.firstname || auth.user.client?.firstname || "Unknown";
    const lastName = auth.user.admin?.lastname || auth.user.agent?.lastname || auth.user.client?.lastname || "";

    return {
        user: auth.user,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(), // Combine first and last name
    };
}
