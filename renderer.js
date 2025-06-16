/**
 * DCUI Renderer
 *
 * This module provides functions to render DCUI (DesignCodeUI) data
 * as SVG diagrams.
 */
import { processMarkdown } from './parser.js';
import { createIconSVG } from './icons.js';
// Constants for rendering
const ELEMENT_HEIGHT = 40;
const ELEMENT_PADDING = 10;
const ELEMENT_MARGIN = 16;
const ELEMENT_RADIUS = 4;
const FONT_FAMILY = 'Arial, sans-serif';
const DEFAULT_FONT_SIZE = 14;
const DEFAULT_TEXT_COLOR = '#212529';
const DEFAULT_APPBAR_HEIGHT = 56;
const DEFAULT_BOTTOM_NAV_HEIGHT = 56;
const DEFAULT_APPBAR_BG_COLOR = '#2196F3';
const DEFAULT_BOTTOM_NAV_BG_COLOR = '#f8f9fa';
const DEFAULT_BUTTON_BG_COLOR = '#007bff';
const DEFAULT_FAB_BG_COLOR = '#FF4081';
/**
 * Renders a parsed DCUI screen as an SVG diagram
 * @param screen - The parsed DCUI screen
 * @param scale - Optional scale factor for the SVG (default: 1.0)
 * @returns SVG markup as a string
 */
function renderDCUIToSVG(screen, scale = 1.0) {
    const width = screen.width;
    const height = screen.height;
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    let svg = `<svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    // Add screen background
    svg += `<rect width="${width}" height="${height}" fill="${screen.backgroundColor}" />`;
    // Render elements
    let yOffset = 0;
    for (const element of screen.elements) {
        const elementSvg = renderElement(element, width, yOffset, scale, height);
        svg += elementSvg.svg;
        yOffset = elementSvg.nextY;
    }
    svg += '</svg>';
    return svg;
}
/**
 * Renders a single DCUI element as SVG
 * @param element - The DCUI element to render
 * @param screenWidth - The width of the screen
 * @param yOffset - The vertical offset for this element
 * @param scale - Scale factor for the SVG
 * @returns Object containing the SVG markup and the next Y position
 */
function renderElement(element, screenWidth, yOffset, scale, screenHeight = 0) {
    const type = element.type.toLowerCase();
    switch (type) {
        case 'appbar':
            return renderAppBar(element, screenWidth, yOffset, scale);
        case 'text':
            return renderText(element, screenWidth, yOffset, scale);
        case 'input':
            return renderInput(element, screenWidth, yOffset, scale);
        case 'button':
            return renderButton(element, screenWidth, yOffset, scale);
        case 'checkbox':
            return renderCheckbox(element, screenWidth, yOffset, scale);
        case 'link':
            return renderLink(element, screenWidth, yOffset, scale);
        case 'image':
            return renderImage(element, screenWidth, yOffset, scale);
        case 'floatingactionbutton':
            return renderFloatingActionButton(element, screenWidth, yOffset, scale, screenHeight);
        case 'bottomnavigationbar':
            return renderBottomNavigationBar(element, screenWidth, yOffset, scale, screenHeight);
        case 'margin':
            return renderMargin(element, screenWidth, yOffset, scale);
        default:
            // For unsupported elements, render a placeholder
            return {
                svg: `<rect x="${ELEMENT_MARGIN}" y="${yOffset}" width="${screenWidth - 2 * ELEMENT_MARGIN}" height="${ELEMENT_HEIGHT}" fill="#f0f0f0" rx="${ELEMENT_RADIUS}" />
              <text x="${screenWidth / 2}" y="${yOffset + ELEMENT_HEIGHT / 2}" font-family="${FONT_FAMILY}" font-size="${DEFAULT_FONT_SIZE}" fill="${DEFAULT_TEXT_COLOR}" text-anchor="middle" dominant-baseline="middle">
                ${element.type}: ${element.label}
              </text>`,
                nextY: yOffset + ELEMENT_HEIGHT + ELEMENT_PADDING
            };
    }
}
/**
 * Renders an AppBar element
 */
function renderAppBar(element, screenWidth, yOffset, _scale) {
    const height = DEFAULT_APPBAR_HEIGHT;
    const backgroundColor = element.backgroundColor || DEFAULT_APPBAR_BG_COLOR;
    const showBackButton = element.showBackButton || false;
    const centerTitle = element.centerTitle || false;
    const actionIcons = element.actionIcons && typeof element.actionIcons === 'string' ? element.actionIcons.split('|') : [];
    let svg = `<rect x="0" y="${yOffset}" width="${screenWidth}" height="${height}" fill="${backgroundColor}" />`;
    // Back button
    if (showBackButton) {
        svg += createIconSVG('mdiArrowLeft', 24, yOffset + height / 2, 24, 'white');
    }
    // Title
    const titleX = centerTitle ? screenWidth / 2 : (showBackButton ? 56 : 16);
    const textAnchor = centerTitle ? 'middle' : 'start';
    svg += `<text x="${titleX}" y="${yOffset + height / 2}" font-family="${FONT_FAMILY}" font-size="20" fill="white" text-anchor="${textAnchor}" dominant-baseline="middle">${element.title}</text>`;
    // Action icons
    if (actionIcons.length > 0) {
        for (let i = 0; i < actionIcons.length; i++) {
            const iconX = screenWidth - 16 - (actionIcons.length - i - 1) * 40;
            const icon = actionIcons[i].trim();
            // Check if this is a Material Design Icon reference (starts with "mdi")
            if (icon.startsWith('mdi')) {
                // Use the createIconSVG function to create an SVG for the icon
                svg += createIconSVG(icon, iconX, yOffset + height / 2, 24, 'white');
            }
            else {
                // Regular text/emoji icon
                svg += `<text x="${iconX}" y="${yOffset + height / 2}" font-family="${FONT_FAMILY}" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${icon}</text>`;
            }
        }
    }
    return {
        svg,
        nextY: yOffset + height
    };
}
/**
 * Renders a Text element
 */
function renderText(element, screenWidth, yOffset, _scale) {
    const content = element.content || element.label;
    const align = element.align || 'center';
    const width = typeof element.width === 'number' ? element.width : (screenWidth - 2 * ELEMENT_MARGIN);
    const fontSize = typeof element.fontSize === 'number' ? element.fontSize : DEFAULT_FONT_SIZE;
    const color = element.color || DEFAULT_TEXT_COLOR;
    const padding = typeof element.padding === 'number' ? element.padding : 0;
    // Calculate x position based on alignment
    let x;
    if (align === 'left') {
        x = ELEMENT_MARGIN;
    }
    else if (align === 'right') {
        x = screenWidth - ELEMENT_MARGIN - width;
    }
    else {
        // center
        x = (screenWidth - width) / 2;
    }
    // Apply padding to yOffset
    yOffset += padding;
    // Wrap text to fit within the width
    const words = typeof content === 'string' ? content.split(' ') : [];
    const lines = [];
    let currentLine = '';
    // Simple text wrapping algorithm
    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = testLine.length * (fontSize * 0.6); // Rough estimate of text width
        if (testWidth > width && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        }
        else {
            currentLine = testLine;
        }
    }
    if (currentLine) {
        lines.push(currentLine);
    }
    // Render each line
    let svg = '';
    const lineHeight = fontSize * 1.2;
    const textAnchor = align === 'center' ? 'middle' : (align === 'right' ? 'end' : 'start');
    const textX = align === 'center' ? (x + width / 2) : (align === 'right' ? (x + width) : x);
    for (let i = 0; i < lines.length; i++) {
        svg += `<text x="${textX}" y="${yOffset + (i + 0.5) * lineHeight}" font-family="${FONT_FAMILY}" font-size="${fontSize}" fill="${color}" text-anchor="${textAnchor}" dominant-baseline="middle">${lines[i]}</text>`;
    }
    return {
        svg,
        nextY: yOffset + lines.length * lineHeight + ELEMENT_PADDING
    };
}
/**
 * Renders an Input element
 */
function renderInput(element, screenWidth, yOffset, _scale) {
    const label = element.label;
    const align = element.align || 'center';
    const width = typeof element.width === 'number' ? element.width : (screenWidth - 2 * ELEMENT_MARGIN);
    const backgroundColor = element.backgroundColor || '#ffffff';
    const padding = typeof element.padding === 'number' ? element.padding : 0;
    // Calculate x position based on alignment
    let x;
    if (align === 'left') {
        x = ELEMENT_MARGIN;
    }
    else if (align === 'right') {
        x = screenWidth - ELEMENT_MARGIN - width;
    }
    else {
        // center
        x = (screenWidth - width) / 2;
    }
    // Apply padding to yOffset
    yOffset += padding;
    const svg = `
    <rect x="${x}" y="${yOffset}" width="${width}" height="${ELEMENT_HEIGHT}" fill="${backgroundColor}" stroke="#ced4da" rx="${ELEMENT_RADIUS}" />
    <text x="${x + 10}" y="${yOffset + ELEMENT_HEIGHT / 2}" font-family="${FONT_FAMILY}" font-size="${DEFAULT_FONT_SIZE}" fill="#6c757d" dominant-baseline="middle">${label}</text>
  `;
    return {
        svg,
        nextY: yOffset + ELEMENT_HEIGHT + ELEMENT_PADDING
    };
}
/**
 * Renders a Button element
 */
function renderButton(element, screenWidth, yOffset, _scale) {
    const label = element.label;
    const align = element.align || 'center';
    const width = typeof element.width === 'number' ? element.width : Math.min(200, screenWidth - 2 * ELEMENT_MARGIN);
    const backgroundColor = element.backgroundColor || DEFAULT_BUTTON_BG_COLOR;
    const padding = typeof element.padding === 'number' ? element.padding : 0;
    // Calculate x position based on alignment
    let x;
    if (align === 'left') {
        x = ELEMENT_MARGIN;
    }
    else if (align === 'right') {
        x = screenWidth - ELEMENT_MARGIN - width;
    }
    else {
        // center
        x = (screenWidth - width) / 2;
    }
    // Apply padding to yOffset
    yOffset += padding;
    const svg = `
    <rect x="${x}" y="${yOffset}" width="${width}" height="${ELEMENT_HEIGHT}" fill="${backgroundColor}" rx="${ELEMENT_RADIUS}" />
    <text x="${x + width / 2}" y="${yOffset + ELEMENT_HEIGHT / 2}" font-family="${FONT_FAMILY}" font-size="${DEFAULT_FONT_SIZE}" fill="white" text-anchor="middle" dominant-baseline="middle">${label}</text>
  `;
    return {
        svg,
        nextY: yOffset + ELEMENT_HEIGHT + ELEMENT_PADDING
    };
}
/**
 * Renders a Checkbox element
 */
function renderCheckbox(element, screenWidth, yOffset, _scale) {
    const label = element.label;
    const align = element.align || 'center';
    const width = typeof element.width === 'number' ? element.width : (screenWidth - 2 * ELEMENT_MARGIN);
    const checked = element.checked || false;
    const padding = typeof element.padding === 'number' ? element.padding : 0;
    // Calculate x position based on alignment
    let x;
    if (align === 'left') {
        x = ELEMENT_MARGIN;
    }
    else if (align === 'right') {
        x = screenWidth - ELEMENT_MARGIN - width;
    }
    else {
        // center
        x = (screenWidth - width) / 2;
    }
    // Apply padding to yOffset
    yOffset += padding;
    const checkboxSize = 20;
    const labelWidth = label.length * (DEFAULT_FONT_SIZE * 0.6); // Estimate label width
    const totalWidth = checkboxSize + 10 + labelWidth; // Checkbox + spacing + label
    // Calculate x position based on alignment
    let checkboxX;
    if (align === 'left') {
        checkboxX = x;
    }
    else if (align === 'right') {
        checkboxX = screenWidth - ELEMENT_MARGIN - labelWidth - 10 - checkboxSize;
    }
    else {
        // center - position the checkbox so that checkbox + label are centered
        checkboxX = (screenWidth - totalWidth) / 2;
    }
    const checkboxY = yOffset + (ELEMENT_HEIGHT - checkboxSize) / 2;
    let svg = `
    <rect x="${checkboxX}" y="${checkboxY}" width="${checkboxSize}" height="${checkboxSize}" fill="white" stroke="#ced4da" rx="2" />
  `;
    if (checked) {
        svg += `
      <polyline points="${checkboxX + 4},${checkboxY + checkboxSize / 2} ${checkboxX + checkboxSize / 3},${checkboxY + checkboxSize - 4} ${checkboxX + checkboxSize - 4},${checkboxY + 4}" stroke="#007bff" stroke-width="2" fill="none" />
    `;
    }
    svg += `
    <text x="${checkboxX + checkboxSize + 10}" y="${yOffset + ELEMENT_HEIGHT / 2}" font-family="${FONT_FAMILY}" font-size="${DEFAULT_FONT_SIZE}" fill="${DEFAULT_TEXT_COLOR}" dominant-baseline="middle">${label}</text>
  `;
    return {
        svg,
        nextY: yOffset + ELEMENT_HEIGHT + ELEMENT_PADDING
    };
}
/**
 * Renders a Link element
 */
function renderLink(element, screenWidth, yOffset, _scale) {
    const label = element.label;
    const align = element.align || 'center';
    const width = typeof element.width === 'number' ? element.width : (screenWidth - 2 * ELEMENT_MARGIN);
    const padding = typeof element.padding === 'number' ? element.padding : 0;
    // Calculate x position based on alignment
    let x;
    if (align === 'left') {
        x = ELEMENT_MARGIN;
    }
    else if (align === 'right') {
        x = screenWidth - ELEMENT_MARGIN - width;
    }
    else {
        // center
        x = (screenWidth - width) / 2;
    }
    // Apply padding to yOffset
    yOffset += padding;
    const textX = align === 'center' ? (x + width / 2) : (align === 'right' ? (x + width) : x);
    const textAnchor = align === 'center' ? 'middle' : (align === 'right' ? 'end' : 'start');
    const svg = `
    <text x="${textX}" y="${yOffset + ELEMENT_HEIGHT / 2}" font-family="${FONT_FAMILY}" font-size="${DEFAULT_FONT_SIZE}" fill="#007bff" text-anchor="${textAnchor}" dominant-baseline="middle">${label}</text>
    <line x1="${textX - (align === 'center' ? label.length * 4 : 0)}" y1="${yOffset + ELEMENT_HEIGHT / 2 + 2}" x2="${textX + (align === 'center' ? label.length * 4 : label.length * 8)}" y2="${yOffset + ELEMENT_HEIGHT / 2 + 2}" stroke="#007bff" stroke-width="1" />
  `;
    return {
        svg,
        nextY: yOffset + ELEMENT_HEIGHT + ELEMENT_PADDING
    };
}
/**
 * Renders an Image element
 */
function renderImage(element, screenWidth, yOffset, _scale) {
    const url = element.url || element.label;
    const align = element.align || 'center';
    const width = typeof element.width === 'number' ? element.width : 200;
    const height = typeof element.height === 'number' ? element.height : 150;
    const padding = typeof element.padding === 'number' ? element.padding : 0;
    // Calculate x position based on alignment
    let x;
    if (align === 'left') {
        x = ELEMENT_MARGIN;
    }
    else if (align === 'right') {
        x = screenWidth - ELEMENT_MARGIN - width;
    }
    else {
        // center
        x = (screenWidth - width) / 2;
    }
    // Apply padding to yOffset
    yOffset += padding;
    // Create a placeholder SVG in case we can't load the image
    const placeholderSvg = `
    <rect x="${x}" y="${yOffset}" width="${width}" height="${height}" fill="#f8f9fa" stroke="#ced4da" rx="4" />
    <text x="${x + width / 2}" y="${yOffset + height / 2 - 15}" font-family="${FONT_FAMILY}" font-size="24" fill="#6c757d" text-anchor="middle" dominant-baseline="middle">🖼️</text>
    <text x="${x + width / 2}" y="${yOffset + height / 2 + 15}" font-family="${FONT_FAMILY}" font-size="${DEFAULT_FONT_SIZE}" fill="#6c757d" text-anchor="middle" dominant-baseline="middle">Image</text>
  `;
    // Check if URL is provided and is a valid URL
    if (url && typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
        // For external images, we'll fetch the image and convert it to base64
        // Since we can't do async operations here, we'll return a placeholder first
        // and then update it when the image is loaded
        // Create a unique ID for this image
        const imageId = `image-${Math.random().toString(36).substring(2, 11)}`;
        // Create a placeholder with the unique ID
        const svg = `
      <g id="${imageId}">
        ${placeholderSvg}
      </g>
    `;
        // Fetch the image and update the SVG when it's loaded
        fetchImageAsBase64(url)
            .then(base64Data => {
            // Find the element with the unique ID
            const element = document.getElementById(imageId);
            if (element) {
                // Update the element with the base64 image
                element.innerHTML = `
            <image x="${x}" y="${yOffset}" width="${width}" height="${height}" href="${base64Data}" preserveAspectRatio="xMidYMid meet" />
          `;
            }
        })
            .catch(error => {
            console.error('Error loading image:', error);
        });
        return {
            svg,
            nextY: yOffset + height + ELEMENT_PADDING
        };
    }
    else {
        // Fallback to placeholder if URL is not provided or not valid
        return {
            svg: placeholderSvg,
            nextY: yOffset + height + ELEMENT_PADDING
        };
    }
}
/**
 * Fetches an image from a URL and converts it to a base64 data URL
 * @param url - The URL of the image to fetch
 * @returns A Promise that resolves to a base64 data URL
 */
function fetchImageAsBase64(url) {
    return new Promise((resolve, reject) => {
        // Create a new image element
        const img = new Image();
        // Set up event handlers
        img.onload = () => {
            try {
                // Create a canvas element
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                // Draw the image on the canvas
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                // Convert the canvas to a base64 data URL
                const dataUrl = canvas.toDataURL('image/png');
                resolve(dataUrl);
            }
            catch (error) {
                reject(error);
            }
        };
        img.onerror = () => {
            reject(new Error(`Failed to load image from URL: ${url}`));
        };
        // Set CORS mode to anonymous to avoid CORS issues
        img.crossOrigin = 'anonymous';
        // Start loading the image
        img.src = url;
    });
}
/**
 * Renders a FloatingActionButton element
 */
function renderFloatingActionButton(element, screenWidth, yOffset, scale, screenHeight = 0) {
    const label = element.label;
    const align = element.align || 'right';
    const backgroundColor = element.backgroundColor || DEFAULT_FAB_BG_COLOR;
    const size = 56;
    const margin = 16; // Margin from the edges
    // Calculate x position based on alignment
    let x;
    if (align === 'left') {
        x = ELEMENT_MARGIN;
    }
    else if (align === 'right') {
        x = screenWidth - ELEMENT_MARGIN - size;
    }
    else {
        // center
        x = (screenWidth - size) / 2;
    }
    // Calculate y position - place at the bottom of the screen with margin
    // If screenHeight is provided, position from bottom, otherwise use yOffset
    let y;
    if (screenHeight > 0) {
        // Position from bottom with margin, and additional space for BottomNavigationBar if present
        y = screenHeight - size - margin - DEFAULT_BOTTOM_NAV_HEIGHT;
    }
    else {
        y = yOffset;
    }
    const svg = `
    <circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="${backgroundColor}" />
    <text x="${x + size / 2}" y="${y + size / 2}" font-family="${FONT_FAMILY}" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">${label}</text>
  `;
    return {
        svg,
        nextY: yOffset + size + ELEMENT_PADDING
    };
}
/**
 * Renders a BottomNavigationBar element
 */
function renderBottomNavigationBar(element, screenWidth, yOffset, scale, screenHeight = 0) {
    const height = DEFAULT_BOTTOM_NAV_HEIGHT;
    const backgroundColor = element.backgroundColor || DEFAULT_BOTTOM_NAV_BG_COLOR;
    // Position the bottom navigation bar at the bottom of the screen
    const bottomPosition = screenHeight > 0 ? screenHeight - height : yOffset;
    let svg = `<rect x="0" y="${bottomPosition}" width="${screenWidth}" height="${height}" fill="${backgroundColor}" />`;
    // Render navigation items
    if (element.children && element.children.length > 0) {
        const itemWidth = screenWidth / element.children.length;
        for (let i = 0; i < element.children.length; i++) {
            const item = element.children[i];
            const itemX = i * itemWidth;
            const icon = item.icon || '';
            const active = item.active || false;
            const color = active ? '#007bff' : '#6c757d';
            // Check if this is a Material Design Icon reference (starts with "mdi")
            if (typeof icon === 'string' && icon.startsWith('mdi')) {
                // Use the createIconSVG function to create an SVG for the icon
                svg += createIconSVG(icon, itemX + itemWidth / 2, bottomPosition + height / 2 - 10, 24, color);
                svg += `
          <text x="${itemX + itemWidth / 2}" y="${bottomPosition + height / 2 + 15}" font-family="${FONT_FAMILY}" font-size="12" fill="${color}" text-anchor="middle" dominant-baseline="middle">${item.label}</text>
        `;
            }
            // Check if this is an image URL
            else if (typeof icon === 'string' && (icon.startsWith('http') ||
                icon.endsWith('.jpg') ||
                icon.endsWith('.jpeg') ||
                icon.endsWith('.png') ||
                icon.endsWith('.svg') ||
                icon.endsWith('.gif'))) {
                // Render as an image
                const iconSize = 24;
                svg += `
          <image href="${icon}" x="${itemX + itemWidth / 2 - iconSize / 2}" y="${bottomPosition + height / 2 - 15 - iconSize / 2}" width="${iconSize}" height="${iconSize}" />
          <text x="${itemX + itemWidth / 2}" y="${bottomPosition + height / 2 + 15}" font-family="${FONT_FAMILY}" font-size="12" fill="${color}" text-anchor="middle" dominant-baseline="middle">${item.label}</text>
        `;
            }
            else {
                // Regular text/emoji icon
                const iconText = typeof icon === 'string' ? icon : '';
                svg += `
          <text x="${itemX + itemWidth / 2}" y="${bottomPosition + height / 2 - 10}" font-family="${FONT_FAMILY}" font-size="20" fill="${color}" text-anchor="middle" dominant-baseline="middle">${iconText}</text>
          <text x="${itemX + itemWidth / 2}" y="${bottomPosition + height / 2 + 15}" font-family="${FONT_FAMILY}" font-size="12" fill="${color}" text-anchor="middle" dominant-baseline="middle">${item.label}</text>
        `;
            }
        }
    }
    return {
        svg,
        nextY: yOffset + height
    };
}
/**
 * Renders a Margin element
 */
function renderMargin(element, screenWidth, yOffset, _scale) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const width = typeof element.width === 'number' ? element.width : screenWidth;
    const height = typeof element.height === 'number' ? element.height : 20;
    // No visible rendering for margin, just add space
    return {
        svg: '',
        nextY: yOffset + height
    };
}
/**
 * Replaces DCUI code blocks in Markdown content with SVG diagrams
 * @param markdown - The Markdown content
 * @param scale - Optional scale factor for the SVG (default: 1.0)
 * @returns Processed Markdown with DCUI blocks replaced by SVG
 */
function replaceDCUIWithSVG(markdown, scale = 1.0) {
    // First, process the markdown to get all DCUI screens
    const screens = processMarkdown(markdown);
    // Then, replace each DCUI code block with its SVG
    let processedMarkdown = markdown;
    const dcuiBlockRegex = /```dcui\n([\s\S]*?)```/g;
    let match;
    let index = 0;
    while ((match = dcuiBlockRegex.exec(markdown)) !== null) {
        if (index < screens.length) {
            const svg = renderDCUIToSVG(screens[index], scale);
            processedMarkdown = processedMarkdown.replace(match[0], `\n\n${svg}\n\n`);
            index++;
        }
    }
    return processedMarkdown;
}
// Export functions for use in other modules
export { renderDCUIToSVG, replaceDCUIWithSVG };
