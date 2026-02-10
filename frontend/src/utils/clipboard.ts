/**
 * Copies text to clipboard with fallback for insecure contexts (HTTP)
 */
export async function copyToClipboard(text: string): Promise<void> {
    // Try modern API first (if available and secure context)
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch (err) {
            console.warn('Clipboard API failed, trying fallback...', err);
        }
    }

    // Fallback for HTTP/Insecure contexts
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;

        // Ensure it's not visible but part of DOM
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (!successful) {
            throw new Error('Fallback copy failed');
        }
    } catch (err) {
        console.error('Failed to copy text:', err);
        throw new Error('Failed to copy to clipboard');
    }
}
