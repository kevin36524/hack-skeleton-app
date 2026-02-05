import { Box, HStack, VStack, Text, Divider } from '@yahoo/uds';
import { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

// Card-like box with borders
export function CardBox({ className, children, ...props }: ComponentProps<typeof Box>) {
  return (
    <Box
      borderWidth="thin"
      borderColor="secondary"
      borderRadius="md"
      backgroundColor="primary"
      {...props}
      className={cn(className)}
    >
      {children}
    </Box>
  );
}

// Hoverable list item with active state
export function HoverableListItem({
  isActive = false,
  className,
  children,
  onClick,
  ...props
}: ComponentProps<typeof Box> & { isActive?: boolean }) {
  return (
    <Box
      display="flex"
      spacing="2"
      borderRadius="md"
      backgroundColor={isActive ? "brand-secondary" : undefined}
      className={cn(
        "cursor-pointer transition-colors hover:bg-[var(--color-bg-secondary)]",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </Box>
  );
}

// Section with optional title and divider
export function Section({ title, children, className }: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <VStack gap="2" className={className}>
      {title && (
        <>
          <Text variant="caption1" color="secondary" className="px-2 pt-2">
            {title}
          </Text>
          <Divider variant="muted" />
        </>
      )}
      {children}
    </VStack>
  );
}
