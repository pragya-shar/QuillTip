import { TextSelection } from './types';

/**
 * Utility functions for handling text selections and browser compatibility
 */

/**
 * Check if the Selection API is supported in the current browser
 */
export function isSelectionAPISupported(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.getSelection !== 'undefined' &&
         typeof document.createRange !== 'undefined';
}

/**
 * Safely get the current selection, handling cross-browser differences
 */
export function getSafeSelection(): Selection | null {
  if (!isSelectionAPISupported()) {
    return null;
  }

  try {
    return window.getSelection();
  } catch (error) {
    console.warn('Error getting selection:', error);
    return null;
  }
}

/**
 * Check if a range is valid and can be used safely
 */
export function isValidRange(range: Range): boolean {
  try {
    // Basic validation
    if (!range || !range.startContainer || !range.endContainer) {
      return false;
    }

    // Check if start comes before end
    const comparison = range.compareBoundaryPoints(Range.START_TO_END, range);
    if (comparison > 0) {
      return false;
    }

    // Check if the range has content
    return range.toString().trim().length > 0;
  } catch (error) {
    console.warn('Error validating range:', error);
    return false;
  }
}

/**
 * Normalize text content by removing extra whitespace
 */
export function normalizeSelectedText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Check if a node is a text node
 */
export function isTextNode(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE;
}

/**
 * Check if a node is an element node
 */
export function isElementNode(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE;
}

/**
 * Get the text content length of a node, handling different node types
 */
export function getNodeTextLength(node: Node): number {
  if (isTextNode(node)) {
    return node.textContent?.length || 0;
  } else if (isElementNode(node)) {
    return node.textContent?.length || 0;
  }
  return 0;
}

/**
 * Check if a selection spans multiple block elements
 */
export function isMultiBlockSelection(selection: TextSelection): boolean {
  const { startContainer, endContainer } = selection;
  
  // If start and end are the same, it's definitely not multi-block
  if (startContainer === endContainer) {
    return false;
  }

  // Find the closest block-level elements
  const startBlock = findClosestBlockElement(startContainer);
  const endBlock = findClosestBlockElement(endContainer);
  
  return startBlock !== endBlock;
}

/**
 * Find the closest block-level element ancestor
 */
function findClosestBlockElement(node: Node): Element | null {
  let current = isElementNode(node) ? node : node.parentElement;
  
  while (current) {
    const style = window.getComputedStyle(current);
    if (style.display === 'block' || 
        style.display === 'list-item' ||
        ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE'].includes(current.tagName)) {
      return current;
    }
    current = current.parentElement;
  }
  
  return null;
}

/**
 * Calculate the percentage of text selected in a container
 */
export function calculateSelectionPercentage(selection: TextSelection, container: Element): number {
  try {
    const totalText = container.textContent || '';
    const selectedText = selection.text;
    
    if (totalText.length === 0) return 0;
    
    return (selectedText.length / totalText.length) * 100;
  } catch (error) {
    console.warn('Error calculating selection percentage:', error);
    return 0;
  }
}

/**
 * Check if the current browser supports touch events
 */
export function isTouchSupported(): boolean {
  return typeof window !== 'undefined' && 
         ('ontouchstart' in window || navigator.maxTouchPoints > 0);
}

/**
 * Debounce utility function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validate if a text selection meets basic requirements
 */
export function validateTextSelection(
  text: string,
  minLength = 1,
  maxLength = 5000
): { isValid: boolean; error?: string } {
  const normalizedText = normalizeSelectedText(text);
  
  if (normalizedText.length < minLength) {
    return {
      isValid: false,
      error: `Selection too short (minimum ${minLength} characters)`
    };
  }
  
  if (normalizedText.length > maxLength) {
    return {
      isValid: false,
      error: `Selection too long (maximum ${maxLength} characters)`
    };
  }
  
  // Check for only whitespace
  if (normalizedText.length === 0) {
    return {
      isValid: false,
      error: 'Selection contains only whitespace'
    };
  }
  
  return { isValid: true };
}