export async function sleepFor(ms) {
    return new Promise(r => setTimeout(() => r(''), ms));
}
