import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Account, Folder } from "@/lib/types/api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Strips the folder prefix from a folder name if the account has a folderPrefix defined
 * @param folderName - The full folder name (e.g., "kevin36524@gmail.com/Inbox")
 * @param account - The account object which may contain a folderPrefix
 * @returns The folder name with prefix stripped (e.g., "Inbox") or original if no prefix
 */
export function stripFolderPrefix(folderName: string, account?: Account): string {
  if (!account?.folderPrefix || !folderName) {
    return folderName;
  }

  // Remove the prefix if it exists at the start of the folder name
  // Handle both "prefix/" and "prefix" cases
  const prefix = account.folderPrefix.endsWith('/')
    ? account.folderPrefix
    : `${account.folderPrefix}/`;

  if (folderName.startsWith(prefix)) {
    return folderName.substring(prefix.length);
  }

  return folderName;
}

/**
 * Gets the display name for a folder, stripping the prefix if applicable
 * @param folder - The folder object
 * @param account - The account object which may contain a folderPrefix
 * @returns The display name for the folder
 */
export function getFolderDisplayName(folder: Folder, account?: Account): string {
  return stripFolderPrefix(folder.name, account);
}
