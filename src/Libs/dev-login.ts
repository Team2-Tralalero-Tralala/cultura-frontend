import { api, setAuthToken } from "./axios";

export async function devAutoLogin() {
    try {
        const res = await api.post("/auth/login", {
            username: "superman",
            password: "hashedpw",
        });
        const token = res.data?.data?.token;
        if (token) {
            localStorage.setItem("accessToken", token);
            setAuthToken(token);
            console.info("[DEV] auto login success");
        } else {
            console.warn("[DEV] no token in login response");
        }
    } catch (e) {
        console.error("[DEV] auto login failed:", e);
    }
}
