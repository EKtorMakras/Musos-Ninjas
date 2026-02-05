export const normalizeFirebaseError = (message = "") => {
    if (!message) {
        return "";
    }

    const sanitized = message.replace(/^Firebase:\s*(?:Error\s*\()?(?:auth\/)?([^)]+)\).*$/i, (_, code) =>
        code.replace(/-/g, " ")
    );

    if (sanitized !== message) {
        return sanitized.trim();
    }

    return message.replace(/^Firebase:\s*/i, "").trim();
};
