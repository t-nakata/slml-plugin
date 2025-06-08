/**
 * SLML Renderer
 * 
 * This module is responsible for rendering SLML (Screen Layout Markup Language) 
 * structured data as SVG.
 */

import { parseSLML, processMarkdown } from './parser.js';

// Constants for SVG rendering
const SVG_PADDING = 20;
const ELEMENT_HEIGHT = 40;
const ELEMENT_MARGIN = 10;
const ELEMENT_WIDTH = 300;
const TITLE_HEIGHT = 50;
const APPBAR_HEIGHT = 60; // Taller height for Appbar
const BOTTOM_NAV_HEIGHT = 60; // Taller height for BottomNavigationBar
const FONT_FAMILY = 'Arial, sans-serif';

/**
 * Render a parsed SLML screen as SVG
 * 
 * @param screen - The parsed SLML screen object
 * @param scale - Optional scale factor for the output SVG (default: 1)
 * @returns SVG string representation
 */
export function renderSLMLToSVG(screen, scale = 1) {
  const elements = screen.elements || [];

  // Separate special elements from regular elements
  const appbarElement = elements.find((el) => el.type.toLowerCase() === 'appbar');
  const bottomNavElement = elements.find((el) => el.type.toLowerCase() === 'bottomnavigationbar');
  const fabElement = elements.find((el) => el.type.toLowerCase() === 'floatingactionbutton');

  // Filter out special elements for normal rendering
  const regularElements = elements.filter((el) => 
    el.type.toLowerCase() !== 'appbar' &&
    el.type.toLowerCase() !== 'bottomnavigationbar' && 
    el.type.toLowerCase() !== 'floatingactionbutton'
  );

  // Calculate SVG dimensions
  const defaultHeight = TITLE_HEIGHT + (regularElements.length * (ELEMENT_HEIGHT + ELEMENT_MARGIN)) + SVG_PADDING * 2;
  const defaultWidth = ELEMENT_WIDTH + SVG_PADDING * 2;

  // Use custom dimensions if provided, otherwise use defaults
  const svgWidth = screen.width || defaultWidth;
  const svgHeight = screen.height || defaultHeight;

  // Start SVG
  // Apply scaling to width and height while keeping the viewBox the same
  const scaledWidth = Math.round(svgWidth * scale);
  const scaledHeight = Math.round(svgHeight * scale);

  let svg = `<svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

  // Add background
  const backgroundColor = screen.backgroundColor || "#f8f9fa";
  svg += `<rect width="100%" height="100%" fill="${backgroundColor}" />`;

  // Add title
  svg += `
    <text 
      x="${SVG_PADDING}" 
      y="${SVG_PADDING + 30}" 
      font-family="${FONT_FAMILY}" 
      font-size="24" 
      font-weight="bold"
    >${screen.title}</text>
  `;

  // Add app bar at the top of the screen if present
  let contentStartY = TITLE_HEIGHT + SVG_PADDING;
  if (appbarElement) {
    const properties = appbarElement.properties || {};
    const backgroundColor = properties.backgroundColor;
    svg += renderAppbar(appbarElement.label, 0, contentStartY, svgWidth, backgroundColor);
    contentStartY += APPBAR_HEIGHT + ELEMENT_MARGIN;
  }

  // Calculate available space for regular elements
  const availableHeight = bottomNavElement 
    ? svgHeight - contentStartY - BOTTOM_NAV_HEIGHT 
    : svgHeight - contentStartY;

  // Add regular elements
  let currentY = contentStartY;
  regularElements.forEach((element) => {
    // Check if we still have space for this element
    if (currentY < contentStartY + availableHeight) {
      svg += renderElement(element, SVG_PADDING, currentY, svgWidth);

      // Update currentY based on the element type
      if (element.type.toLowerCase() === 'image') {
        // For images, use the actual height from properties or default
        const properties = element.properties || {};
        const height = properties.height ? parseInt(properties.height, 10) : ELEMENT_HEIGHT;
        currentY += height + ELEMENT_MARGIN;
      } else if (element.type.toLowerCase() === 'margin') {
        // For margins, use the height from the label
        const height = parseInt(element.label.replace(/[^0-9]/g, ''), 10) || ELEMENT_HEIGHT;
        currentY += height + ELEMENT_MARGIN;
      } else if (element.type.toLowerCase() === 'text') {
        // For text, calculate height based on text wrapping
        const properties = element.properties || {};
        const fontSize = properties.fontSize ? parseInt(properties.fontSize, 10) : 14;
        const lineHeight = fontSize * 1.2; // 1.2 is a common line-height multiplier

        // Calculate maximum width for text
        const maxWidth = properties.width ? parseInt(properties.width, 10) : svgWidth - 40;

        // Approximate characters per line
        const avgCharWidth = fontSize * 0.6; // Rough estimate of character width
        const charsPerLine = Math.floor(maxWidth / avgCharWidth);

        // Split text into words and calculate lines
        const words = element.label.split(' ');
        let lines = 1; // Start with at least one line
        let currentLineLength = 0;

        // Count how many lines we need
        words.forEach(word => {
          if (currentLineLength + word.length + 1 <= charsPerLine) {
            // Add word to current line
            currentLineLength += (currentLineLength ? 1 : 0) + word.length;
          } else {
            // Start a new line
            lines++;
            currentLineLength = word.length;
          }
        });

        // Calculate total height and update currentY
        const textHeight = lines * lineHeight;
        currentY += textHeight + ELEMENT_MARGIN;
      } else {
        // For other elements, use the default height
        currentY += ELEMENT_HEIGHT + ELEMENT_MARGIN;
      }
    }
  });

  // Add bottom navigation bar at the bottom of the screen
  if (bottomNavElement) {
    const bottomNavY = svgHeight - BOTTOM_NAV_HEIGHT;
    const properties = bottomNavElement.properties || {};
    const backgroundColor = properties.backgroundColor;
    svg += renderBottomNavigationBar(bottomNavElement.label, 0, bottomNavY, svgWidth, backgroundColor, bottomNavElement);
  }

  // Add floating action button 48px from the bottom-right, above the bottom nav if present
  if (fabElement) {
    const properties = fabElement.properties || {};
    const backgroundColor = properties.backgroundColor;
    // Adjust FAB position to ensure it doesn't overlap with BottomNavigationBar
    // The FAB radius is 30px, so we need to position its center at least 30px + 48px from the bottom
    const fabY = svgHeight - (bottomNavElement ? BOTTOM_NAV_HEIGHT + 48 + 30 : 48 + 30);
    svg += renderFloatingActionButton(fabElement.label, SVG_PADDING, fabY, backgroundColor, svgWidth);
  }

  // Close SVG
  svg += '</svg>';

  return svg;
}

/**
 * Render a single SLML element as SVG
 * 
 * @param element - The SLML element object
 * @param x - The base x position
 * @param y - The y position
 * @param screenWidth - The width of the screen
 * @returns SVG string representation of the element
 */
function renderElement(element, x, y, screenWidth) {
  const type = element.type;
  const label = element.label;
  const properties = element.properties || {};
  const align = properties.align || 'center';
  const padding = properties.padding ? parseInt(properties.padding, 10) : 0;
  const backgroundColor = properties.backgroundColor;

  // For images, get the width from properties
  let elementWidth = ELEMENT_WIDTH;
  if (type.toLowerCase() === 'image' && properties.width) {
    elementWidth = parseInt(properties.width, 10);
  }

  // Calculate x position based on alignment
  let alignedX = x;

  if (align === 'left') {
    alignedX = 16; // Left margin
  } else if (align === 'center') {
    alignedX = (screenWidth - elementWidth) / 2;
  } else if (align === 'right') {
    alignedX = screenWidth - elementWidth - 16; // Right margin
  }

  // Apply padding to y position
  const paddedY = y + padding;

  switch (type.toLowerCase()) {
    case 'appbar':
      return renderAppbar(label, alignedX, paddedY, screenWidth, backgroundColor, properties);
    case 'bottomnavigationbar':
      return renderBottomNavigationBar(label, alignedX, paddedY, screenWidth, backgroundColor, element);
    case 'floatingactionbutton':
      return renderFloatingActionButton(label, alignedX, paddedY, backgroundColor);
    case 'input':
      return renderInput(label, alignedX, paddedY, backgroundColor);
    case 'button':
      return renderButton(label, alignedX, paddedY, backgroundColor);
    case 'checkbox':
      return renderCheckbox(label, alignedX, paddedY, backgroundColor);
    case 'link':
      return renderLink(label, alignedX, paddedY, backgroundColor);
    case 'margin':
      return renderMargin(label, alignedX, paddedY, backgroundColor, properties);
    case 'image':
      return renderImage(label, alignedX, paddedY, backgroundColor, properties);
    case 'text':
      return renderText(label, alignedX, paddedY, screenWidth, backgroundColor, properties);
    default:
      return renderGenericElement(type, label, alignedX, paddedY, backgroundColor);
  }
}

/**
 * Render an input field
 */
function renderInput(label, x, y, backgroundColor) {
  return `
    <rect 
      x="${x}" 
      y="${y}" 
      width="${ELEMENT_WIDTH}" 
      height="${ELEMENT_HEIGHT}" 
      rx="4" 
      ry="4" 
      fill="${backgroundColor || 'white'}" 
      stroke="#ced4da" 
      stroke-width="1"
    />
    <text 
      x="${x + 10}" 
      y="${y + ELEMENT_HEIGHT/2 + 5}" 
      font-family="${FONT_FAMILY}" 
      font-size="14" 
      fill="#6c757d"
    >${label}</text>
  `;
}

/**
 * Render a button
 */
function renderButton(label, x, y, backgroundColor) {
  return `
    <rect 
      x="${x}" 
      y="${y}" 
      width="${ELEMENT_WIDTH}" 
      height="${ELEMENT_HEIGHT}" 
      rx="4" 
      ry="4" 
      fill="${backgroundColor || '#007bff'}" 
      stroke="none"
    />
    <text 
      x="${x + ELEMENT_WIDTH/2}" 
      y="${y + ELEMENT_HEIGHT/2 + 5}" 
      font-family="${FONT_FAMILY}" 
      font-size="14" 
      fill="white" 
      text-anchor="middle"
    >${label}</text>
  `;
}

/**
 * Render a checkbox
 */
function renderCheckbox(label, x, y, backgroundColor) {
  return `
    <rect 
      x="${x}" 
      y="${y + ELEMENT_HEIGHT/2 - 10}" 
      width="20" 
      height="20" 
      rx="2" 
      ry="2" 
      fill="${backgroundColor || 'white'}" 
      stroke="#ced4da" 
      stroke-width="1"
    />
    <text 
      x="${x + 30}" 
      y="${y + ELEMENT_HEIGHT/2 + 5}" 
      font-family="${FONT_FAMILY}" 
      font-size="14" 
      fill="#212529"
    >${label}</text>
  `;
}

/**
 * Render a link
 */
function renderLink(label, x, y, backgroundColor) {
  // Links typically don't have a background, but we'll add a background rect if specified
  let backgroundRect = '';
  if (backgroundColor) {
    backgroundRect = `
    <rect 
      x="${x}" 
      y="${y}" 
      width="${ELEMENT_WIDTH}" 
      height="${ELEMENT_HEIGHT}" 
      rx="4" 
      ry="4" 
      fill="${backgroundColor}" 
      stroke="none"
    />`;
  }

  return `
    ${backgroundRect}
    <text 
      x="${x}" 
      y="${y + ELEMENT_HEIGHT/2 + 5}" 
      font-family="${FONT_FAMILY}" 
      font-size="14" 
      fill="#007bff" 
      text-decoration="underline"
    >${label}</text>
  `;
}

/**
 * Render a margin (empty space)
 */
function renderMargin(label, x, y, backgroundColor, properties) {
  // Get dimensions from properties or parse from label
  const width = properties?.width ? parseInt(properties.width, 10) : ELEMENT_WIDTH;
  const height = properties?.height ? parseInt(properties.height, 10) : parseInt(label.replace(/[^0-9]/g, ''), 10) || ELEMENT_HEIGHT;

  // Margins are just empty space, but we'll add a background rect if specified
  if (backgroundColor) {
    return `
    <rect 
      x="${x}" 
      y="${y}" 
      width="${width}" 
      height="${height}" 
      fill="${backgroundColor}" 
      stroke="none"
    />`;
  }

  // If no background color, return an empty string (invisible element)
  return '';
}

/**
 * Render an image
 */
function renderImage(label, x, y, backgroundColor, properties) {
  // The label is used as the image URL
  const imageUrl = label;
  // Get image dimensions from properties or use defaults
  const width = properties?.width ? parseInt(properties.width, 10) : ELEMENT_WIDTH;
  const height = properties?.height ? parseInt(properties.height, 10) : ELEMENT_HEIGHT;

  // Background for the image
  let backgroundRect = '';
  if (backgroundColor) {
    backgroundRect = `
    <rect 
      x="${x}" 
      y="${y}" 
      width="${width}" 
      height="${height}" 
      fill="${backgroundColor}" 
      stroke="none"
    />`;
  }

  // SVG doesn't support external images directly, so we'll use a placeholder rect with the URL as text
  return `
    ${backgroundRect}
    <rect 
      x="${x}" 
      y="${y}" 
      width="${width}" 
      height="${height}" 
      fill="#e9ecef" 
      stroke="#ced4da" 
      stroke-width="1"
    />
    <text 
      x="${x + width/2}" 
      y="${y + height/2}" 
      font-family="${FONT_FAMILY}" 
      font-size="12" 
      text-anchor="middle"
      fill="#6c757d"
    >Image: ${imageUrl}</text>
  `;
}

/**
 * Render a generic element
 */
function renderGenericElement(type, label, x, y, backgroundColor) {
  return `
    <rect 
      x="${x}" 
      y="${y}" 
      width="${ELEMENT_WIDTH}" 
      height="${ELEMENT_HEIGHT}" 
      rx="4" 
      ry="4" 
      fill="${backgroundColor || '#e9ecef'}" 
      stroke="#ced4da" 
      stroke-width="1"
    />
    <text 
      x="${x + 10}" 
      y="${y + ELEMENT_HEIGHT/2 - 5}" 
      font-family="${FONT_FAMILY}" 
      font-size="12" 
      fill="#6c757d"
    >${type}</text>
    <text 
      x="${x + 10}" 
      y="${y + ELEMENT_HEIGHT/2 + 15}" 
      font-family="${FONT_FAMILY}" 
      font-size="14" 
      fill="#212529"
    >${label}</text>
  `;
}

/**
 * Render an app bar
 */
function renderAppbar(label, x, y, screenWidth, backgroundColor, properties) {
  // App bar spans the full width of the screen
  let svg = `
    <rect 
      x="0" 
      y="${y}" 
      width="${screenWidth}" 
      height="${APPBAR_HEIGHT}" 
      fill="${backgroundColor || '#2196F3'}" 
    />`;

  // Check if back button should be shown
  const showBackButton = properties?.showBackButton === true || properties?.showBackButton === 'true';

  // Check if title should be centered
  const centerTitle = properties?.centerTitle === true || properties?.centerTitle === 'true';

  // Calculate positions for title
  let titleX = SVG_PADDING;

  // Adjust title position if back button is shown
  if (showBackButton) {
    titleX = SVG_PADDING + 40;
  }

  // Center the title if centerTitle is true
  if (centerTitle) {
    titleX = screenWidth / 2;
  }

  // Add back button if specified
  if (showBackButton) {
    svg += `
    <!-- Back button -->
    <circle 
      cx="${SVG_PADDING + 15}" 
      cy="${y + APPBAR_HEIGHT/2}" 
      r="15" 
      fill="rgba(255, 255, 255, 0.2)" 
    />
    <text 
      x="${SVG_PADDING + 15}" 
      y="${y + APPBAR_HEIGHT/2 + 5}" 
      font-family="${FONT_FAMILY}" 
      font-size="18" 
      text-anchor="middle"
      fill="white" 
    >←</text>`;
  }

  // Add title with appropriate text-anchor based on centerTitle
  svg += `
    <text 
      x="${titleX}" 
      y="${y + APPBAR_HEIGHT/2 + 5}" 
      font-family="${FONT_FAMILY}" 
      font-size="16" 
      font-weight="bold"
      fill="white"
      text-anchor="${centerTitle ? 'middle' : 'start'}"
    >${label}</text>`;

  // Add action icons if specified
  if (properties?.actionIcons) {
    const icons = properties.actionIcons.split('|');
    const iconSpacing = 40;
    const startX = screenWidth - (icons.length * iconSpacing) + 10;

    icons.forEach((icon, index) => {
      const iconX = startX + (index * iconSpacing);
      svg += `
      <!-- Action icon ${index + 1} -->
      <circle 
        cx="${iconX}" 
        cy="${y + APPBAR_HEIGHT/2}" 
        r="15" 
        fill="rgba(255, 255, 255, 0.2)" 
      />
      <text 
        x="${iconX}" 
        y="${y + APPBAR_HEIGHT/2 + 5}" 
        font-family="${FONT_FAMILY}" 
        font-size="14" 
        text-anchor="middle"
        fill="white" 
      >${icon}</text>`;
    });
  }

  return svg;
}

/**
 * Render a bottom navigation bar
 */
function renderBottomNavigationBar(label, x, y, screenWidth, backgroundColor, element) {
  // Bottom navigation bar spans the full width of the screen
  let svg = `
    <rect 
      x="0" 
      y="${y}" 
      width="${screenWidth}" 
      height="${BOTTOM_NAV_HEIGHT}" 
      fill="${backgroundColor || '#f8f9fa'}" 
      stroke="#ced4da"
      stroke-width="1"
    />`;

  // If there are child items, render them
  if (element && element.children && element.children.length > 0) {
    const items = element.children;
    const itemWidth = screenWidth / items.length;

    // Render each navigation item
    items.forEach((item, index) => {
      const itemX = index * itemWidth;
      svg += renderBottomNavigationItem(item.label, itemX, y, itemWidth, item.properties);
    });
  } else {
    // No items, just render the label
    svg += `
    <text 
      x="${screenWidth / 2}" 
      y="${y + BOTTOM_NAV_HEIGHT/2 + 5}" 
      font-family="${FONT_FAMILY}" 
      font-size="14" 
      text-anchor="middle"
      fill="#212529" 
    >${label}</text>`;
  }

  return svg;
}

/**
 * Render a bottom navigation item
 */
function renderBottomNavigationItem(label, x, y, width, properties) {
  const isActive = properties?.active === 'true';
  const icon = properties?.icon || '';
  const textColor = isActive ? '#2196F3' : '#757575';
  const fontWeight = isActive ? 'bold' : 'normal';
  const backgroundColor = isActive ? '#E3F2FD' : '#F5F5F5'; // Changed from #FFFFFF to #F5F5F5 for better visibility

  return `
    <g>
      <!-- Item background -->
      <rect 
        x="${x}" 
        y="${y}" 
        width="${width}" 
        height="${BOTTOM_NAV_HEIGHT}" 
        fill="${backgroundColor}" 
        stroke="#E0E0E0" 
        stroke-width="1"
      />

      <!-- Icon placeholder -->
      <text 
        x="${x + width/2}" 
        y="${y + BOTTOM_NAV_HEIGHT/2 - 8}" 
        font-family="${FONT_FAMILY}" 
        font-size="18" 
        text-anchor="middle"
        fill="${textColor}"
      >${icon}</text>

      <!-- Label -->
      <text 
        x="${x + width/2}" 
        y="${y + BOTTOM_NAV_HEIGHT/2 + 12}" 
        font-family="${FONT_FAMILY}" 
        font-size="12" 
        text-anchor="middle"
        fill="${textColor}"
        font-weight="${fontWeight}"
      >${label}</text>
    </g>
  `;
}

/**
 * Render a text element with automatic wrapping
 */
function renderText(text, x, y, screenWidth, backgroundColor, properties) {
  // Get the maximum width for text (with some margin)
  const maxWidth = properties?.width ? parseInt(properties.width, 10) : screenWidth - 40;

  // Approximate characters per line (assuming average character width)
  // This is a rough estimate - in a real implementation, you might want to use canvas to measure text width
  const fontSize = properties?.fontSize ? parseInt(properties.fontSize, 10) : 14;
  const avgCharWidth = fontSize * 0.6; // Rough estimate of character width
  const charsPerLine = Math.floor(maxWidth / avgCharWidth);

  // Split text into words
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  // Create lines of text
  words.forEach(word => {
    if (currentLine.length + word.length + 1 <= charsPerLine) {
      // Add word to current line
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      // Start a new line
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  });

  // Add the last line
  if (currentLine) {
    lines.push(currentLine);
  }

  // Calculate total height needed for the text
  const lineHeight = fontSize * 1.2; // 1.2 is a common line-height multiplier
  const textHeight = lines.length * lineHeight;

  // Get text color from properties or use default
  const textColor = properties?.color || "#212529";

  // Background for the text
  let backgroundRect = '';
  if (backgroundColor) {
    backgroundRect = `
    <rect 
      x="${x}" 
      y="${y}" 
      width="${maxWidth}" 
      height="${textHeight}" 
      fill="${backgroundColor}" 
      stroke="none"
    />`;
  }

  // Create SVG text element with tspan elements for each line
  let textSvg = `
    ${backgroundRect}
    <text 
      x="${x}" 
      y="${y + fontSize}" 
      font-family="${FONT_FAMILY}" 
      font-size="${fontSize}" 
      fill="${textColor}"
    >`;

  // Add each line as a tspan
  lines.forEach((line, index) => {
    if (index === 0) {
      // First line is already positioned by the text element
      textSvg += `<tspan x="${x}" dy="0">${line}</tspan>`;
    } else {
      // Subsequent lines need to be positioned below the previous line
      textSvg += `<tspan x="${x}" dy="${lineHeight}">${line}</tspan>`;
    }
  });

  // Close the text element
  textSvg += `</text>`;

  return textSvg;
}

/**
 * Render a floating action button
 */
function renderFloatingActionButton(label, x, y, backgroundColor, screenWidth) {
  // Floating action button is circular
  const radius = 30;

  // Position at the bottom-right corner if screenWidth is provided
  const cx = screenWidth ? screenWidth - radius - 16 : x + ELEMENT_WIDTH - radius;
  const cy = y + radius;

  return `
    <circle 
      cx="${cx}" 
      cy="${cy}" 
      r="${radius}" 
      fill="${backgroundColor || '#FF4081'}" 
    />
    <text 
      x="${cx}" 
      y="${cy + 5}" 
      font-family="${FONT_FAMILY}" 
      font-size="14" 
      text-anchor="middle"
      fill="white" 
    >${label}</text>
  `;
}

/**
 * Process Markdown content and render all SLML screens as SVG
 * 
 * @param markdownContent - The Markdown content
 * @param scale - Optional scale factor for the output SVG (default: 1)
 * @returns Array of SVG strings
 */
export function renderMarkdownSLML(markdownContent, scale = 1) {
  const screens = processMarkdown(markdownContent);
  return screens.map(screen => renderSLMLToSVG(screen, scale));
}

/**
 * Replace SLML code blocks in Markdown with rendered SVG
 * 
 * @param markdownContent - The Markdown content
 * @param scale - Optional scale factor for the output SVG (default: 1)
 * @returns Markdown with SLML blocks replaced by SVG
 */
export function replaceSLMLWithSVG(markdownContent, scale = 1) {
  let result = markdownContent;
  const slmlBlocks = processMarkdown(markdownContent);
  const svgBlocks = slmlBlocks.map(screen => renderSLMLToSVG(screen, scale));

  // Replace each SLML block with its SVG
  let blockIndex = 0;
  result = result.replace(/```slml\s+([\s\S]*?)```/g, (match) => {
    if (blockIndex < svgBlocks.length) {
      const svg = svgBlocks[blockIndex++];
      return svg;
    }
    return match;
  });

  return result;
}
