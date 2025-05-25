// Helper function to show toast and log to console (assuming showAppToast is global)
export function showToastAndLog(message, level = 'info', duration = 4000) {
    if (window.showAppToast) {
        window.showAppToast(message, level, duration);
    } else {
        console.warn(`[${level}] ${message} (showAppToast not found)`);
        alert(`[${level.toUpperCase()}]: ${message}`); // Fallback
    }
    if (level === 'error') console.error(message);
    else if (level === 'warn') console.warn(message);
    else console.log(message);
}

// Safe string compare function that handles undefined/null values
export function safeCompare(a, b) {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    const strA = String(a).trim();
    const strB = String(b).trim();
    return strA.toLowerCase().localeCompare(strB.toLowerCase());
}

// Get platform names for a game
export function getPlatformNames(game, allPlatforms) {
    if (!game?.platforms || typeof game.platforms !== 'object') return '';
    const platformIds = Object.keys(game.platforms);

    if (!Array.isArray(allPlatforms)) {
        return platformIds.join(', '); // Fallback
    }

    return platformIds
        .map(pid => {
            const platformObject = allPlatforms.find(p => p.id === pid);
            return platformObject?.name || pid;
        })
        .filter(name => name && name.trim())
        .sort()
        .join(', ');
}
