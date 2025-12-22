import { IAssistant } from '../types/entities';

/**
 * Generates the URL for an assistant using name (if URL-safe) or _id
 * @param assistant - The assistant object or identifier
 * @returns The URL path for the assistant
 */
export function getAssistantUrl(assistant: IAssistant | { _id: string; name?: string } | string): string {
  // If it's just a string (ID or name), use it directly
  if (typeof assistant === 'string') {
    return `/admin/assistants/${assistant}`;
  }
  
  // Debug logging
  console.log('getAssistantUrl - assistant:', assistant);
  console.log('getAssistantUrl - name:', assistant.name);
  console.log('getAssistantUrl - _id:', assistant._id);
  
  // Use name if it exists and is URL-safe, otherwise fallback to _id
  const isUrlSafeName = assistant.name && isValidAssistantName(assistant.name);
  const identifier = isUrlSafeName ? assistant.name : assistant._id;
  
  console.log('getAssistantUrl - using identifier:', identifier);
    
  return `/admin/assistants/${identifier}`;
}

/**
 * Validates if an assistant name is URL-safe (matches backend validation)
 * @param name - The name to validate
 * @returns true if valid, false otherwise
 */
export function isValidAssistantName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  // Check length constraints
  if (name.length < 2 || name.length > 50) {
    return false;
  }
  
  // Check pattern - must match backend validation
  return /^[a-zA-Z0-9]+([_-][a-zA-Z0-9]+)*$/.test(name);
}

/**
 * Get validation error message for assistant name
 * @param name - The name to validate
 * @returns An error message if invalid, or null if valid
 */
export function validateAssistantName(name: string | undefined): string | null {
  if (!name || name.trim() === '') {
    return 'Assistant name is required';
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < 2) {
    return 'Name must be at least 2 characters';
  }
  
  if (trimmedName.length > 50) {
    return 'Name must not exceed 50 characters';
  }
  
  if (trimmedName.includes(' ')) {
    return 'No spaces allowed. Use hyphens (-) or underscores (_)';
  }
  
  if (!/^[a-zA-Z0-9]+([_-][a-zA-Z0-9]+)*$/.test(trimmedName)) {
    return 'Only letters, numbers, hyphens (-), and underscores (_) allowed';
  }
  
  return null; // Valid
}

/**
 * Suggests a valid URL name based on an invalid input
 * @param invalidName - The invalid name to convert
 * @returns A suggested valid URL name
 */
export function suggestValidUrlName(invalidName: string): string {
  if (!invalidName) return '';
  
  return invalidName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with hyphens
    .replace(/[^a-z0-9_-]/g, '') // Remove invalid characters
    .replace(/-+/g, '-')         // Replace multiple hyphens with single
    .replace(/^-|-$/g, '')       // Remove leading/trailing hyphens
    .slice(0, 50) || 'assistant'; // Limit length and provide fallback
}

/**
 * Checks if a string is a valid MongoDB ObjectID
 * @param str - The string to check
 * @returns True if it's a valid ObjectID format
 */
export function isObjectId(str: string): boolean {
  return /^[a-f\d]{24}$/i.test(str);
}