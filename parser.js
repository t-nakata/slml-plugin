/**
 * SLML Parser
 * 
 * This module is responsible for parsing SLML (Screen Layout Markup Language) code blocks
 * from Markdown documents and converting them to structured JSON data.
 * 
 * SLML is a simple markup language for describing UI screens with various elements
 * like inputs, buttons, checkboxes, etc.
 */

/**
 * Parse SLML code block and convert it to structured data
 * 
 * @param {string} slmlCode - The SLML code block content
 * @returns {Object} Parsed SLML screen object
 */
export function parseSLML(slmlCode) {
  const lines = slmlCode.trim().split('\n');

  // Parse screen title, dimensions, and background color
  const titleLine = lines[0];
  let title = 'Untitled Screen';
  let width;
  let height;
  let backgroundColor;

  if (titleLine.startsWith('Screen:')) {
    // Extract title and properties
    const titleContent = titleLine.substring('Screen:'.length).trim();

    // Check if properties are specified
    const propertiesMatch = titleContent.match(/^(.*?)\s*\(\s*(.*?)\s*\)\s*$/);

    if (propertiesMatch) {
      title = propertiesMatch[1].trim();

      // Parse properties
      const propsString = propertiesMatch[2].trim();
      const propPairs = propsString.split(',');

      for (const pair of propPairs) {
        const [key, value] = pair.split(':').map(part => part.trim());
        if (key && value) {
          if (key === 'width') {
            width = parseInt(value, 10);
          } else if (key === 'height') {
            height = parseInt(value, 10);
          } else if (key === 'backgroundColor') {
            backgroundColor = value;
          }
        }
      }
    } else {
      title = titleContent;
    }
  }

  // Parse elements
  const elements = [];
  const parentStack = [];
  let lastIndentLevel = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) continue;

    // Calculate indent level (number of spaces at the beginning of the line)
    const indentLevel = line.search(/\S|$/);
    const trimmedLine = line.trim();

    // Check if line starts with "- " which indicates an element
    if (trimmedLine.startsWith('- ')) {
      const elementText = trimmedLine.substring(2).trim();
      const element = parseElement(elementText);

      if (element) {
        // If this is an indented element
        if (indentLevel > lastIndentLevel) {
          // Add it as a child of the last element
          if (parentStack.length > 0) {
            const parent = parentStack[parentStack.length - 1].element;
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push(element);
          }
        } 
        // If this is at the same level as the last element
        else if (indentLevel === lastIndentLevel) {
          // If we have a parent, add it as a sibling to the last element
          if (parentStack.length > 0 && indentLevel > 0) {
            // Get the appropriate parent based on indentation level
            const parent = parentStack.find(p => p.indentLevel < indentLevel)?.element;
            if (parent && parent.children) {
              parent.children.push(element);
            }
          } 
          // Otherwise, add it to the root elements
          else {
            elements.push(element);
          }
        }
        // If this is at a lower indent level than the last element
        else {
          // Pop elements from the parent stack until we find the right level
          while (parentStack.length > 0 && parentStack[parentStack.length - 1].indentLevel >= indentLevel) {
            parentStack.pop();
          }

          // If we have a parent at this level, add it as a child
          if (parentStack.length > 0) {
            const parent = parentStack[parentStack.length - 1].element;
            if (!parent.children) {
              parent.children = [];
            }
            parent.children.push(element);
          }
          // Otherwise, add it to the root elements
          else {
            elements.push(element);
          }
        }

        // Update the parent stack and last indent level
        if (element.type.toLowerCase() === 'bottomnavigationbar') {
          parentStack.push({ element, indentLevel });
        }
        lastIndentLevel = indentLevel;
      }
    }
  }

  console.log(`Parsed SLML Screen: ${title}, Elements: ${elements}, Width: ${width}, Height: ${height}, Background Color: ${backgroundColor}`);


  return {
    title,
    elements,
    width,
    height,
    backgroundColor
  };
}

/**
 * Parse a single SLML element
 * 
 * @param {string} elementText - The element text (e.g., "Input: Username")
 * @returns {Object|null} Parsed SLML element object
 */
function parseElement(elementText) {
  // Split by first colon to separate type and label
  const colonIndex = elementText.indexOf(':');

  if (colonIndex === -1) {
    console.warn(`Invalid element format: ${elementText}`);
    return null;
  }

  const type = elementText.substring(0, colonIndex).trim();
  let labelAndProps = elementText.substring(colonIndex + 1).trim();

  // Check if properties are specified
  const propertiesMatch = labelAndProps.match(/^(.*?)\s*{\s*(.*?)\s*}$/);

  let label;
  let properties = {};
  let children;

  if (propertiesMatch) {
    // Extract label and properties
    label = propertiesMatch[1].trim();

    // Parse properties
    const propsString = propertiesMatch[2].trim();

    // Parse properties normally
    const propPairs = propsString.split(',');

    for (const pair of propPairs) {
      const [key, value] = pair.split(':').map(part => part.trim());
      if (key && value) {
        properties[key] = value;
      }
    }
  } else {
    label = labelAndProps;
  }

  // Set default alignment if not specified
  if (!properties.align) {
    properties.align = 'center';
  }

  return {
    type,
    label,
    properties,
    children
  };
}


/**
 * Extract SLML code blocks from Markdown content
 * 
 * @param {string} markdownContent - The Markdown content
 * @returns {string[]} Array of extracted SLML code blocks
 */
export function extractSLMLFromMarkdown(markdownContent) {
  const slmlBlocks = [];

  // Regular expression to match ```slml ... ``` code blocks
  const slmlBlockRegex = /```slml\s+([\s\S]*?)```/g;

  let match;
  while ((match = slmlBlockRegex.exec(markdownContent)) !== null) {
    slmlBlocks.push(match[1].trim());
  }

  return slmlBlocks;
}

/**
 * Process Markdown content and return parsed SLML screens
 * 
 * @param {string} markdownContent - The Markdown content
 * @returns {Object[]} Array of parsed SLML screen objects
 */
export function processMarkdown(markdownContent) {
  const slmlBlocks = extractSLMLFromMarkdown(markdownContent);
  return slmlBlocks.map(block => parseSLML(block));
}
