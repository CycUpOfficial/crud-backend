export const parseCookies = (cookieHeader = "") =>
    cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .filter(Boolean)
        .reduce((acc, cookie) => {
            const separatorIndex = cookie.indexOf("=");
            if (separatorIndex === -1) return acc;
            const key = cookie.slice(0, separatorIndex).trim();
            const value = cookie.slice(separatorIndex + 1).trim();
            acc[key] = decodeURIComponent(value);
            return acc;
        }, {});