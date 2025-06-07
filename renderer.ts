/**
 * SLML Renderer
 * 
 * This module is responsible for rendering SLML (Screen Layout Markup Language) 
 * structured data as SVG.
 */

import { parseSLML, processMarkdown } from './parser';

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
 * @returns SVG string representation
 */
export function renderSLMLToSVG(screen: any): string {
  const elements = screen.elements || [];

  // Separate special elements from regular elements
  const appbarElement = elements.find((el: any) => el.type.toLowerCase() === 'appbar');
  const bottomNavElement = elements.find((el: any) => el.type.toLowerCase() === 'bottomnavigationbar');
  const fabElement = elements.find((el: any) => el.type.toLowerCase() === 'floatingactionbutton');

  // Filter out special elements for normal rendering
  const regularElements = elements.filter((el: any) => 
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
  let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

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
  regularElements.forEach((element: any) => {
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
function renderElement(element: any, x: number, y: number, screenWidth: number): string {
  const type = element.type;
  const label = element.label;
  const properties = element.properties || {};
  const align = properties.align || 'center';
  const padding = properties.padding ? parseInt(properties.padding, 10) : 0;
  const backgroundColor = properties.backgroundColor;

  // Calculate x position based on alignment
  let alignedX = x;

  if (align === 'left') {
    alignedX = 16; // Left margin
  } else if (align === 'center') {
    alignedX = (screenWidth - ELEMENT_WIDTH) / 2;
  } else if (align === 'right') {
    alignedX = screenWidth - ELEMENT_WIDTH - 16; // Right margin
  }

  // Apply padding to y position
  const paddedY = y + padding;

  switch (type.toLowerCase()) {
    case 'appbar':
      return renderAppbar(label, alignedX, paddedY, screenWidth, backgroundColor);
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
    default:
      return renderGenericElement(type, label, alignedX, paddedY, backgroundColor);
  }
}

/**
 * Render an input field
 */
function renderInput(label: string, x: number, y: number, backgroundColor?: string): string {
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
function renderButton(label: string, x: number, y: number, backgroundColor?: string): string {
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
function renderCheckbox(label: string, x: number, y: number, backgroundColor?: string): string {
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
function renderLink(label: string, x: number, y: number, backgroundColor?: string): string {
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
function renderMargin(label: string, x: number, y: number, backgroundColor?: string, properties?: any): string {
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
function renderImage(label: string, x: number, y: number, backgroundColor?: string, properties?: any): string {
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
function renderGenericElement(type: string, label: string, x: number, y: number, backgroundColor?: string): string {
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
function renderAppbar(label: string, x: number, y: number, screenWidth: number, backgroundColor?: string): string {
  // App bar spans the full width of the screen
  return `
    <rect 
      x="0" 
      y="${y}" 
      width="${screenWidth}" 
      height="${APPBAR_HEIGHT}" 
      fill="${backgroundColor || '#2196F3'}" 
    />
    <text 
      x="${SVG_PADDING}" 
      y="${y + APPBAR_HEIGHT/2 + 5}" 
      font-family="${FONT_FAMILY}" 
      font-size="16" 
      font-weight="bold"
      fill="white" 
    >${label}</text>
  `;
}

/**
 * Render a bottom navigation bar
 */
function renderBottomNavigationBar(label: string, x: number, y: number, screenWidth: number, backgroundColor?: string, element?: any): string {
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
    items.forEach((item: any, index: number) => {
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
function renderBottomNavigationItem(label: string, x: number, y: number, width: number, properties?: any): string {
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
 * Render a floating action button
 */
function renderFloatingActionButton(label: string, x: number, y: number, backgroundColor?: string, screenWidth?: number): string {
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
 * @returns Array of SVG strings
 */
export function renderMarkdownSLML(markdownContent: string): string[] {
  const screens = processMarkdown(markdownContent);
  return screens.map(screen => renderSLMLToSVG(screen));
}

/**
 * Replace SLML code blocks in Markdown with rendered SVG
 * 
 * @param markdownContent - The Markdown content
 * @returns Markdown with SLML blocks replaced by SVG
 */
export function replaceSLMLWithSVG(markdownContent: string): string {
  let result = markdownContent;
  const slmlBlocks = processMarkdown(markdownContent);
  const svgBlocks = slmlBlocks.map(screen => renderSLMLToSVG(screen));

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
