"use client";

import "./email.css";
import React, { useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Icon,
  IconButton,
  Divider,
  AvatarText,
  Button,
  Badge,
  DARK_COLOR_MODE_CLASSNAME,
  LIGHT_COLOR_MODE_CLASSNAME,
} from "@yahoo/uds";
import {
  Inbox,
  PaperPlane,
  DraftDocument,
  Trash,
  Folder,
  Star,
  Archive,
  MagnifyingGlass,
  Cog,
  Refresh,
  Printer,
  MoreVertical,
  Paperclip,
  Check,
  Envelope,
  RetailTag,
  Add,
  Priority,
  Sun,
  CrescentMoon,
} from "@yahoo/uds-icons";

// Types
interface EmailFolder {
  id: string;
  name: string;
  icon: typeof Inbox;
  count?: number;
  isActive?: boolean;
}

interface EmailMessage {
  id: string;
  sender: string;
  senderInitials: string;
  subject: string;
  preview: string;
  time: string;
  isStarred: boolean;
  isRead: boolean;
  hasAttachment?: boolean;
}

// Mock Data
const folders: EmailFolder[] = [
  { id: "inbox", name: "Inbox", icon: Inbox, count: 12, isActive: true },
  { id: "starred", name: "Starred", icon: Star, count: 3 },
  { id: "sent", name: "Sent", icon: PaperPlane },
  { id: "drafts", name: "Drafts", icon: DraftDocument, count: 2 },
  { id: "archive", name: "Archive", icon: Archive },
  { id: "trash", name: "Trash", icon: Trash },
];

const customFolders: EmailFolder[] = [
  { id: "work", name: "Work", icon: Folder },
  { id: "personal", name: "Personal", icon: Folder },
  { id: "finance", name: "Finance", icon: Folder },
];

const emails: EmailMessage[] = [
  {
    id: "1",
    sender: "Sarah Johnson",
    senderInitials: "SJ",
    subject: "Q4 Marketing Report - Action Required",
    preview: "Hi team, please review the attached Q4 marketing report and provide your feedback by...",
    time: "10:42 AM",
    isStarred: true,
    isRead: false,
    hasAttachment: true,
  },
  {
    id: "2",
    sender: "Michael Chen",
    senderInitials: "MC",
    subject: "Project Update: Mobile App Launch",
    preview: "Great news! The beta testing phase has been completed successfully and we're on track for...",
    time: "9:15 AM",
    isStarred: false,
    isRead: false,
  },
  {
    id: "3",
    sender: "Emily Davis",
    senderInitials: "ED",
    subject: "Team Lunch Friday",
    preview: "Hey everyone! I'm organizing a team lunch this Friday at 12:30 PM. Let me know if you...",
    time: "Yesterday",
    isStarred: false,
    isRead: true,
  },
  {
    id: "4",
    sender: "David Wilson",
    senderInitials: "DW",
    subject: "Re: Contract Review",
    preview: "I've reviewed the contract and have a few suggestions regarding section 4.2...",
    time: "Yesterday",
    isStarred: true,
    isRead: true,
    hasAttachment: true,
  },
  {
    id: "5",
    sender: "Jessica Martinez",
    senderInitials: "JM",
    subject: "Welcome to the team!",
    preview: "Hi there! On behalf of the entire team, I wanted to welcome you and let you know...",
    time: "Mon",
    isStarred: false,
    isRead: true,
  },
];

// Components
function FolderItem({ folder }: { folder: EmailFolder }) {
  return (
    <HStack
      gap="3"
      alignItems="center"
      justifyContent="space-between"
      spacing="2"
      spacingHorizontal="3"
      borderRadius="md"
      backgroundColor={folder.isActive ? "brand-secondary" : undefined}
      className="cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors"
    >
      <HStack gap="3" alignItems="center" justifyContent="flex-start">
        <Icon
          name={folder.icon}
          size="sm"
          variant="outline"
          color={folder.isActive ? "brand" : "secondary"}
        />
        <Text
          variant="label2"
          color={folder.isActive ? "brand" : "primary"}
        >
          {folder.name}
        </Text>
      </HStack>
      {folder.count && folder.count > 0 && (
        <Badge variant={folder.isActive ? "brand" : "secondary"} size="sm">
          {folder.count}
        </Badge>
      )}
    </HStack>
  );
}

function EmailListItem({
  email,
  isSelected,
  onSelect,
}: {
  email: EmailMessage;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      spacing="3"
      borderRadius="md"
      backgroundColor={isSelected ? "brand-secondary" : undefined}
      className={`cursor-pointer transition-colors ${!isSelected ? "hover:bg-[var(--color-bg-secondary)]" : ""}`}
      onClick={onSelect}
    >
      <HStack gap="3" alignItems="flex-start" justifyContent="flex-start">
        <AvatarText initials={email.senderInitials} size="sm" />
        <VStack gap="1" alignItems="flex-start" justifyContent="flex-start" className="flex-1 min-w-0">
          <HStack gap="2" alignItems="center" justifyContent="space-between" className="w-full">
            <Text
              variant={email.isRead ? "label2" : "headline1"}
              color="primary"
              className="truncate"
            >
              {email.sender}
            </Text>
            <HStack gap="1" alignItems="center" justifyContent="flex-end" className="shrink-0">
              {email.hasAttachment && (
                <Icon name={Paperclip} size="xs" color="secondary" />
              )}
              <Text variant="caption2" color="secondary">
                {email.time}
              </Text>
            </HStack>
          </HStack>
          <Text
            variant={email.isRead ? "label3" : "label2"}
            color="primary"
            className="truncate w-full"
          >
            {email.subject}
          </Text>
          <Text variant="caption1" color="secondary" className="truncate w-full">
            {email.preview}
          </Text>
        </VStack>
        <Box display="flex" className="shrink-0">
          <Icon
            name={Star}
            size="sm"
            variant={email.isStarred ? "fill" : "outline"}
            color={email.isStarred ? "warning" : "tertiary"}
          />
        </Box>
      </HStack>
    </Box>
  );
}

function MessageDetail({ email }: { email: EmailMessage }) {
  return (
    <VStack gap="0" alignItems="stretch" justifyContent="flex-start" className="h-full">
      {/* Message Header */}
      <Box display="flex" flexDirection="column" spacing="4" rowGap="4">
        <HStack gap="2" alignItems="center" justifyContent="flex-end">
          <IconButton
            name={Archive}
            variant="tertiary"
            size="sm"
            aria-label="Archive"
          />
          <IconButton
            name={Trash}
            variant="tertiary"
            size="sm"
            aria-label="Delete"
          />
          <IconButton
            name={RetailTag}
            variant="tertiary"
            size="sm"
            aria-label="Label"
          />
          <IconButton
            name={MoreVertical}
            variant="tertiary"
            size="sm"
            aria-label="More options"
          />
        </HStack>

        <HStack gap="4" alignItems="flex-start" justifyContent="flex-start">
          <AvatarText initials={email.senderInitials} size="lg" />
          <VStack gap="1" alignItems="flex-start" justifyContent="flex-start" className="flex-1">
            <HStack gap="2" alignItems="center" justifyContent="space-between" className="w-full">
              <Text variant="headline1" color="primary">
                {email.sender}
              </Text>
              <Text variant="caption1" color="secondary">
                {email.time}
              </Text>
            </HStack>
            <Text variant="caption1" color="secondary">
              to me
            </Text>
          </VStack>
        </HStack>

        <Text variant="title3" color="primary">
          {email.subject}
        </Text>
      </Box>

      <Divider variant="secondary" />

      {/* Message Body */}
      <Box display="flex" flexDirection="column" spacing="4" rowGap="4" className="flex-1 overflow-auto">
        <VStack gap="4" alignItems="flex-start" justifyContent="flex-start">
          <Text variant="body1" color="primary">
            Hi,
          </Text>
          <Text variant="body1" color="primary">
            {email.preview} This is an important message that requires your attention. Please review the details below and let me know if you have any questions.
          </Text>
          <Text variant="body1" color="primary">
            Key points to consider:
          </Text>
          <VStack gap="2" alignItems="flex-start" justifyContent="flex-start" className="pl-4">
            <Text variant="body1" color="primary">• Review the attached documents</Text>
            <Text variant="body1" color="primary">• Provide feedback by end of week</Text>
            <Text variant="body1" color="primary">• Schedule a follow-up meeting if needed</Text>
          </VStack>
          <Text variant="body1" color="primary">
            Looking forward to your response.
          </Text>
          <VStack gap="1" alignItems="flex-start" justifyContent="flex-start">
            <Text variant="body1" color="primary">Best regards,</Text>
            <Text variant="body1" color="primary">{email.sender}</Text>
          </VStack>
        </VStack>

        {email.hasAttachment && (
          <Box
            display="flex"
            flexDirection="row"
            columnGap="3"
            spacing="3"
            borderWidth="thin"
            borderColor="secondary"
            borderRadius="md"
            alignItems="center"
            className="w-fit"
          >
            <Box
              display="flex"
              spacing="2"
              backgroundColor="secondary"
              borderRadius="sm"
              alignItems="center"
              justifyContent="center"
            >
              <Icon name={Paperclip} size="sm" color="secondary" />
            </Box>
            <VStack gap="0" alignItems="flex-start" justifyContent="flex-start">
              <Text variant="label3" color="primary">Q4_Marketing_Report.pdf</Text>
              <Text variant="caption2" color="secondary">2.4 MB</Text>
            </VStack>
          </Box>
        )}
      </Box>

      <Divider variant="secondary" />

      {/* Reply Actions */}
      <Box display="flex" flexDirection="row" columnGap="2" spacing="4">
        <Button variant="primary" size="md" startIcon={PaperPlane}>
          Reply
        </Button>
        <Button variant="secondary" size="md">
          Forward
        </Button>
      </Box>
    </VStack>
  );
}

export default function EmailApp() {
  const [selectedEmailId, setSelectedEmailId] = useState(emails[0].id);
  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      backgroundColor="primary"
      className={`uds-email h-screen w-full ${isDarkMode ? DARK_COLOR_MODE_CLASSNAME : LIGHT_COLOR_MODE_CLASSNAME}`}
    >
      {/* Top Header Bar */}
      <Box
        display="flex"
        flexDirection="row"
        spacingHorizontal="4"
        spacingVertical="2"
        borderBottomWidth="thin"
        borderColor="secondary"
        alignItems="center"
        justifyContent="space-between"
      >
        <HStack gap="4" alignItems="center" justifyContent="flex-start">
          <Text variant="title3" color="brand">
            Yahoo Mail
          </Text>
        </HStack>

        <HStack gap="2" alignItems="center" justifyContent="flex-end" className="flex-1 max-w-md">
          <Box
            display="flex"
            flexDirection="row"
            columnGap="2"
            spacing="2"
            backgroundColor="secondary"
            borderRadius="md"
            alignItems="center"
            className="flex-1"
          >
            <Icon name={MagnifyingGlass} size="sm" color="secondary" />
            <Text variant="label2" color="tertiary">
              Search mail
            </Text>
          </Box>
        </HStack>

        <HStack gap="2" alignItems="center" justifyContent="flex-end">
          <IconButton
            name={isDarkMode ? CrescentMoon : Sun}
            variant="tertiary"
            size="sm"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          />
          <IconButton
            name={Cog}
            variant="tertiary"
            size="sm"
            aria-label="Settings"
          />
          <AvatarText initials="YU" size="sm" />
        </HStack>
      </Box>

      {/* Main Content Area */}
      <HStack gap="0" alignItems="stretch" justifyContent="flex-start" className="flex-1 overflow-hidden">
        {/* Folder Panel */}
        <Box
          display="flex"
          flexDirection="column"
          rowGap="1"
          spacing="3"
          borderEndWidth="thin"
          borderColor="secondary"
          className="w-56 overflow-auto"
        >
          <Button variant="brand" size="md" startIcon={Add} className="mb-2">
            Compose
          </Button>

          <VStack gap="1" alignItems="stretch" justifyContent="flex-start">
            {folders.map((folder) => (
              <FolderItem key={folder.id} folder={folder} />
            ))}
          </VStack>

          <Divider variant="muted" />

          <Text variant="caption1" color="secondary" className="px-2">
            Folders
          </Text>
          <VStack gap="1" alignItems="stretch" justifyContent="flex-start">
            {customFolders.map((folder) => (
              <FolderItem key={folder.id} folder={folder} />
            ))}
          </VStack>
        </Box>

        {/* Messages List Panel */}
        <Box
          display="flex"
          flexDirection="column"
          rowGap="0"
          borderEndWidth="thin"
          borderColor="secondary"
          className="w-80 overflow-hidden"
        >
          {/* List Header */}
          <Box
            display="flex"
            flexDirection="row"
            spacingHorizontal="3"
            spacingVertical="2"
            borderBottomWidth="thin"
            borderColor="secondary"
            alignItems="center"
            justifyContent="space-between"
          >
            <HStack gap="2" alignItems="center" justifyContent="flex-start">
              <Text variant="headline1" color="primary">
                Inbox
              </Text>
              <Badge variant="brand" size="sm">12</Badge>
            </HStack>
            <HStack gap="1" alignItems="center" justifyContent="flex-end">
              <IconButton
                name={Refresh}
                variant="tertiary"
                size="xs"
                aria-label="Refresh"
              />
              <IconButton
                name={MoreVertical}
                variant="tertiary"
                size="xs"
                aria-label="More options"
              />
            </HStack>
          </Box>

          {/* Filter Bar */}
          <Box
            display="flex"
            flexDirection="row"
            columnGap="2"
            spacingHorizontal="3"
            spacingVertical="2"
            borderBottomWidth="thin"
            borderColor="secondary"
            alignItems="center"
          >
            <HStack gap="2" alignItems="center" justifyContent="flex-start">
              <Icon name={Check} size="xs" color="secondary" />
              <Text variant="caption1" color="secondary">All</Text>
            </HStack>
            <Divider vertical className="h-4" />
            <HStack gap="2" alignItems="center" justifyContent="flex-start">
              <Icon name={Envelope} size="xs" color="secondary" />
              <Text variant="caption1" color="secondary">Unread</Text>
            </HStack>
            <Divider vertical className="h-4" />
            <HStack gap="2" alignItems="center" justifyContent="flex-start">
              <Icon name={Priority} size="xs" color="secondary" />
              <Text variant="caption1" color="secondary">Priority</Text>
            </HStack>
          </Box>

          {/* Email List */}
          <VStack gap="0" alignItems="stretch" justifyContent="flex-start" className="flex-1 overflow-auto">
            {emails.map((email) => (
              <React.Fragment key={email.id}>
                <EmailListItem
                  email={email}
                  isSelected={email.id === selectedEmailId}
                  onSelect={() => setSelectedEmailId(email.id)}
                />
                <Divider variant="muted" />
              </React.Fragment>
            ))}
          </VStack>
        </Box>

        {/* Message Detail Panel */}
        <Box
          display="flex"
          flexDirection="column"
          className="flex-1 overflow-hidden"
        >
          <MessageDetail email={selectedEmail} />
        </Box>
      </HStack>
    </Box>
  );
}
