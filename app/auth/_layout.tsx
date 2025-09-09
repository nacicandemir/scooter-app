import { Redirect, Slot } from "expo-router";
import { useAuth } from "~/providers/AuthProvider";

export default function AuthLayout() {
    const { isAuthenticated }: any = useAuth();

    if(isAuthenticated) {
        return <Redirect href="/" />
    }

    return <Slot />
}