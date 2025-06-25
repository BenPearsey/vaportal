export function useInitials() {
    return (firstName?: string, lastName?: string) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
        return `${firstInitial}${lastInitial}` || "U"; // Default to "U" if both are missing
    };
}
