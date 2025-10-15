import { api, setAuthToken } from "./axios";

export async function superLogin() {
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
export async function adminLogin() {
    try {
        const res = await api.post("/auth/login", {
            username: "admin1",
            password: "hashedpw",
        });
        const token = res.data?.data?.token;
        if (token) {
            // ลบภายหลังถ้าไม่ใช้ cookie นะจ๊ะ
            localStorage.setItem("accessToken", token);
            document.cookie = `accessToken=${token}; path=/; SameSite=Lax`;


            //localStorage.setItem("accessToken", token);
            setAuthToken(token);
            console.info("[DEV] auto login success");
        } else {
            console.warn("[DEV] no token in login response");
        }
    } catch (e) {
        console.error("[DEV] auto login failed:", e);
    }
}
export async function memberLogin() {
    try {
        const res = await api.post("/auth/login", {
            username: "member1",
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

export async function touristLogin() {
    try {
        const res = await api.post("/auth/login", {
            username: "tourist1",
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