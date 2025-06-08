/**
 * SLML Parser
 * 
 * This module provides functions to parse SLML (Screen Layout Markup Language) code blocks
 * in Markdown content and convert them to structured JSON data.
 */

/**
 * Interface for a parsed SLML screen
 */
interface SLMLScreen {
  title: string;
  width: number;
  height: number;
  backgroundColor: string;
  elements: SLMLElement[];
}

/**
 * Interface for a parsed SLML element
 */
interface SLMLElement {
  type: string;
  label: string;
  [key: string]: any; // Allow any property at the same level as type and label
  children?: SLMLElement[];
}

/**
 * Default screen properties
 */
const DEFAULT_SCREEN_WIDTH = 360;
const DEFAULT_SCREEN_HEIGHT = 640;
const DEFAULT_SCREEN_BACKGROUND_COLOR = '#ffffff';

/**
 * Extracts SLML code blocks from Markdown content
 * @param markdown - The Markdown content
 * @returns An array of SLML code blocks
 */
function extractSLMLBlocks(markdown: string): string[] {
  const slmlBlockRegex = /```slml\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;

  while ((match = slmlBlockRegex.exec(markdown)) !== null) {
    blocks.push(match[1]);
  }

  return blocks;
}

/**
 * Parses a single SLML code block
 * @param slml - The SLML code block
 * @returns A parsed SLML screen object
 */
function parseSLML(slml: string): SLMLScreen {
  const lines = slml.trim().split('\n');
  const screen: SLMLScreen = {
    title: '',
    width: DEFAULT_SCREEN_WIDTH,
    height: DEFAULT_SCREEN_HEIGHT,
    backgroundColor: DEFAULT_SCREEN_BACKGROUND_COLOR,
    elements: []
  };

  // Parse screen title and properties from the first line
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.startsWith('#')) {
      // Comment line, treat as title
      screen.title = firstLine.substring(1).trim();
      lines.shift();
    } else if (firstLine.startsWith('Screen:')) {
      const titleMatch = /Screen:\s*(.*?)(?:\s*\(|$)/.exec(firstLine);
      if (titleMatch) {
        screen.title = titleMatch[1].trim();
      }

      // Parse screen properties
      const widthMatch = /width:\s*(\d+)/.exec(firstLine);
      const heightMatch = /height:\s*(\d+)/.exec(firstLine);
      const bgColorMatch = /backgroundColor:\s*(#[0-9a-fA-F]{3,6})/.exec(firstLine);

      if (widthMatch) screen.width = parseInt(widthMatch[1], 10);
      if (heightMatch) screen.height = parseInt(heightMatch[1], 10);
      if (bgColorMatch) screen.backgroundColor = bgColorMatch[1];

      lines.shift();
    }
  }

  // Parse elements
  let currentElement: SLMLElement | null = null;
  let currentIndentation = 0;
  let elementStack: { element: SLMLElement, indentation: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // Skip empty lines

    // Calculate indentation level
    const indentMatch = /^(\s*)/.exec(line);
    const indentation = indentMatch ? indentMatch[1].length : 0;

    if (line.trim().startsWith('-')) {
      // Element line
      const elementMatch = /^\s*-\s*([\w]+):\s*(.*?)(?:\s*\{|$)/.exec(line);
      if (elementMatch) {
        const type = elementMatch[1].trim();
        const label = elementMatch[2].trim();

        // Parse properties
        const propertiesMatch = /\{\s*(.*?)\s*\}/.exec(line);
        const properties: Record<string, any> = {};

        if (propertiesMatch) {
          const propertiesStr = propertiesMatch[1];
          const propertyPairs = propertiesStr.split(',');

          for (const pair of propertyPairs) {
            const [key, value] = pair.split(':').map(s => s.trim());
            if (key && value) {
              // Convert boolean strings to actual booleans
              if (value === 'true') {
                properties[key] = true;
              } else if (value === 'false') {
                properties[key] = false;
              } else if (!isNaN(Number(value))) {
                properties[key] = Number(value);
              } else {
                properties[key] = value;
              }
            }
          }
        }

        const element: SLMLElement = {
          type,
          label
        };

        // Add properties directly to the element
        for (const key in properties) {
          element[key] = properties[key];
        }

        // Check if this is a child element
        if (indentation > currentIndentation) {
          // This is a child of the previous element
          if (currentElement) {
            if (!currentElement.children) {
              currentElement.children = [];
            }
            currentElement.children.push(element);
            elementStack.push({ element: currentElement, indentation: currentIndentation });
            currentElement = element;
            currentIndentation = indentation;
          }
        } else if (indentation < currentIndentation) {
          // Go back up the stack to find the parent
          while (elementStack.length > 0 && elementStack[elementStack.length - 1].indentation >= indentation) {
            const popped = elementStack.pop();
            if (popped) {
              currentElement = popped.element;
              currentIndentation = popped.indentation;
            }
          }

          // Add this element to the appropriate parent
          if (elementStack.length > 0) {
            const parent = elementStack[elementStack.length - 1].element;
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push(element);
          } else {
            screen.elements.push(element);
          }

          currentElement = element;
          currentIndentation = indentation;
        } else {
          // Same indentation level, add to the same parent
          if (elementStack.length > 0) {
            const parent = elementStack[elementStack.length - 1].element;
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push(element);
          } else {
            screen.elements.push(element);
          }

          currentElement = element;
        }
      }
    } else if (line.trim().startsWith('screen:')) {
      // Screen properties in indented format
      // Mark the next lines as screen properties until we hit a blank line or a non-indented line
      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];
        if (!nextLine.trim()) {
          // Blank line, end of screen properties
          break;
        }

        const nextIndentMatch = /^(\s*)/.exec(nextLine);
        const nextIndentation = nextIndentMatch ? nextIndentMatch[1].length : 0;

        if (nextIndentation === 0) {
          // Non-indented line, end of screen properties
          break;
        }

        // This is a screen property
        const propertyMatch = /^\s*(\w+):\s*(.*)$/.exec(nextLine);
        if (propertyMatch) {
          const key = propertyMatch[1].trim();
          let value = propertyMatch[2].trim();

          // Handle special property values
          if (key === 'size') {
            // Parse size property (format: width, height)
            const sizeMatch = /(\d+),\s*(\d+)/.exec(value);
            if (sizeMatch) {
              screen.width = parseInt(sizeMatch[1], 10);
              screen.height = parseInt(sizeMatch[2], 10);
            }
          } else if (key === 'backgroundColor') {
            screen.backgroundColor = value;
          } else if (key === 'title') {
            if (value.startsWith('"') && value.endsWith('"')) {
              // Remove quotes from string values
              screen.title = value.substring(1, value.length - 1);
            } else {
              screen.title = value;
            }
          }
        }

        j++;
      }

      // Skip all the lines we just processed
      i = j - 1;
      continue;
    } else if (indentation === 0 && /^[a-zA-Z]+:/.test(line.trim())) {
      // Element type in indented format (e.g., "button:", "input:", etc.)
      const elementTypeMatch = /^([a-zA-Z]+):\s*(.*)$/.exec(line.trim());
      if (elementTypeMatch) {
        const type = elementTypeMatch[1].trim();
        const label = elementTypeMatch[2].trim();

        const element: SLMLElement = {
          type,
          label
        };

        // Add the element to the screen
        screen.elements.push(element);

        // Set as current element for subsequent property lines
        currentElement = element;
        currentIndentation = indentation;

        // Process properties in subsequent indented lines
        let j = i + 1;
        while (j < lines.length) {
          const nextLine = lines[j];
          if (!nextLine.trim()) {
            // Blank line, end of element properties
            break;
          }

          const nextIndentMatch = /^(\s*)/.exec(nextLine);
          const nextIndentation = nextIndentMatch ? nextIndentMatch[1].length : 0;

          if (nextIndentation === 0) {
            // Non-indented line, end of element properties
            break;
          }

          // This is an element property or a children declaration
          if (nextLine.trim() === 'children:') {
            // Initialize children array
            if (!element.children) {
              element.children = [];
            }

            // Process children in subsequent lines
            j++;
            continue;
          } else if (nextLine.trim().startsWith('-')) {
            // Child element line
            const childElementMatch = /^\s*-\s*([a-zA-Z]+):\s*(.*)$/.exec(nextLine);
            if (childElementMatch) {
              const childType = childElementMatch[1].trim();
              const childLabel = childElementMatch[2].trim();

              const childElement: SLMLElement = {
                type: childType,
                label: childLabel
              };

              // Add child to parent element
              if (!element.children) {
                element.children = [];
              }
              element.children.push(childElement);

              // Process child properties in subsequent lines
              let k = j + 1;
              while (k < lines.length) {
                const childLine = lines[k];
                if (!childLine.trim()) {
                  // Blank line, end of child properties
                  break;
                }

                const childIndentMatch = /^(\s*)/.exec(childLine);
                const childIndentation = childIndentMatch ? childIndentMatch[1].length : 0;

                if (childIndentation <= nextIndentation) {
                  // Less or equal indentation, end of child properties
                  break;
                }

                // This is a child property
                const childPropertyMatch = /^\s*([a-zA-Z]+):\s*(.*)$/.exec(childLine);
                if (childPropertyMatch) {
                  const key = childPropertyMatch[1].trim();
                  let value = childPropertyMatch[2].trim();

                  // Handle special property values
                  if (value === 'true') {
                    childElement[key] = true;
                  } else if (value === 'false') {
                    childElement[key] = false;
                  } else if (!isNaN(Number(value))) {
                    childElement[key] = Number(value);
                  } else if (value.startsWith('"') && value.endsWith('"')) {
                    // Remove quotes from string values
                    childElement[key] = value.substring(1, value.length - 1);
                  } else {
                    childElement[key] = value;
                  }
                }

                k++;
              }

              j = k - 1;
            }
          } else {
            // Element property
            const propertyMatch = /^\s*([a-zA-Z]+):\s*(.*)$/.exec(nextLine);
            if (propertyMatch) {
              const key = propertyMatch[1].trim();
              let value = propertyMatch[2].trim();

              // Handle special property values
              if (value === 'true') {
                element[key] = true;
              } else if (value === 'false') {
                element[key] = false;
              } else if (!isNaN(Number(value))) {
                element[key] = Number(value);
              } else if (value.startsWith('"') && value.endsWith('"')) {
                // Remove quotes from string values
                element[key] = value.substring(1, value.length - 1);
              } else {
                element[key] = value;
              }
            }
          }

          j++;
        }

        // Skip all the lines we just processed
        i = j - 1;
        continue;
      }
    } else if (indentation > 0 && currentElement) {
      // Property line for the current element
      const propertyMatch = /^\s*(\w+):\s*(.*)$/.exec(line);
      if (propertyMatch) {
        const key = propertyMatch[1].trim();
        let value = propertyMatch[2].trim();

        // Handle special property values
        if (value === 'true') {
          currentElement[key] = true;
        } else if (value === 'false') {
          currentElement[key] = false;
        } else if (!isNaN(Number(value))) {
          currentElement[key] = Number(value);
        } else if (value.startsWith('"') && value.endsWith('"')) {
          // Remove quotes from string values
          currentElement[key] = value.substring(1, value.length - 1);
        } else {
          currentElement[key] = value;
        }
      } else if (line.trim() === 'children:') {
        // Initialize children array if not already done
        if (!currentElement.children) {
          currentElement.children = [];
        }
      }
    }
  }

  console.log('Parsed SLML to JSON:', JSON.stringify(screen, null, 2));
  return screen;
}

/**
 * Processes Markdown content to extract and parse SLML code blocks
 * @param markdown - The Markdown content
 * @returns An array of parsed SLML screen objects
 */
function processMarkdown(markdown: string): SLMLScreen[] {
  const blocks = extractSLMLBlocks(markdown);
  const screens = blocks.map(block => parseSLML(block));
  console.log('Processed Markdown to JSON:', JSON.stringify(screens, null, 2));
  return screens;
}

// Export functions for use in other modules
export { parseSLML, processMarkdown, SLMLScreen, SLMLElement };
