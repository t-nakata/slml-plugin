/**
 * Material Design Icons Integration
 *
 * This module provides functions to import and use Material Design Icons from CDN.
 */
// We'll load the icons dynamically from the CDN at runtime
// This approach allows the TypeScript compiler to work without errors
// while still enabling the browser to load icons from the CDN
// Map to store loaded icons
const iconMap = {};
// List of supported icons
const supportedIcons = [
    'mdiAccountCircle',
    'mdiCheckDecagram',
    'mdiEmail',
    'mdiMenu',
    'mdiDotsVertical',
    'mdiMagnify',
    'mdiCog',
    'mdiAccount',
    'mdiHelpCircle',
    'mdiPencil',
    'mdiStar',
    'mdiArrowLeft',
    'mdiHome',
    'mdiCalendar',
    'mdiCamera',
    'mdiDelete',
    'mdiDownload',
    'mdiUpload',
    'mdiFavorite',
    'mdiHeart',
    'mdiInformation',
    'mdiLock',
    'mdiMap',
    'mdiMessage',
    'mdiNotification',
    'mdiPhone',
    'mdiPlus',
    'mdiRefresh',
    'mdiSave',
    'mdiSend',
    'mdiSettings',
    'mdiShare',
    'mdiShoppingCart',
    'mdiThumbUp',
    'mdiThumbDown',
    'mdiTrash',
    'mdiWarning'
];
// Load the icons when this module is imported
(async function loadIcons() {
    try {
        // In a browser environment, dynamically import the icons
        if (typeof window !== 'undefined') {
            // Use a string-based approach that TypeScript won't try to resolve during compilation
            const importURL = 'https://cdn.jsdelivr.net/npm/@mdi/js@7.4.47/dist/mdi.js';
            // Use Function constructor to create a dynamic import that TypeScript won't check
            // This is a workaround for TypeScript's URL import limitations
            const dynamicImport = new Function('url', 'return import(url)');
            const module = await dynamicImport(importURL);
            // Store each icon in the map
            for (const iconName of supportedIcons) {
                if (module[iconName]) {
                    iconMap[iconName] = module[iconName];
                }
            }
        }
    }
    catch (error) {
        console.error('Error loading Material Design Icons:', error);
    }
})();
/**
 * Gets the SVG path data for a Material Design Icon
 * @param iconName - The name of the icon (e.g., 'mdiAccountCircle')
 * @returns The SVG path data for the icon, or undefined if not found
 */
export function getIconPath(iconName) {
    return iconMap[iconName];
}
/**
 * Creates an SVG element for a Material Design Icon
 * @param iconName - The name of the icon (e.g., 'mdiAccountCircle')
 * @param x - The x position of the icon
 * @param y - The y position of the icon
 * @param size - The size of the icon (width and height)
 * @param color - The color of the icon
 * @returns SVG markup for the icon, or a placeholder if the icon is not found
 */
export function createIconSVG(iconName, x, y, size = 24, color = 'currentColor') {
    const iconPath = getIconPath(iconName);
    if (iconPath) {
        return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" x="${x - size / 2}" y="${y - size / 2}" fill="${color}">
        <path d="${iconPath}"></path>
      </svg>
    `;
    }
    else {
        // Return a placeholder if the icon is not found
        return `
      <text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size / 2}" fill="${color}" text-anchor="middle" dominant-baseline="middle">[${iconName}]</text>
    `;
    }
}
