'use client';

// From shadcn/ui (new-york), restyled to Ink & Signal: glass-strong surface,
// our type sizes and radii. Behaviour (focus, typeahead, arrow keys, Esc)
// comes from Radix. Restyle any component added with `npx shadcn add`
// before using it; never ship shadcn's default look.
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CheckIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

export function DropdownMenu(props: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

export function DropdownMenuTrigger(props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  inline = false,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  /** Render in place instead of in a portal. Needed inside a modal <dialog>,
      which sits in the top layer above anything portalled to <body>. */
  inline?: boolean;
}) {
  const content = (
    <DropdownMenuPrimitive.Content
      data-slot="dropdown-menu-content"
      sideOffset={sideOffset}
      className={cn(
        'glass-strong ff-menu z-50 min-w-52 overflow-hidden rounded-lg p-1.5 text-fg shadow-menu',
        className,
      )}
      {...props}
    />
  );
  return inline ? content : <DropdownMenuPrimitive.Portal>{content}</DropdownMenuPrimitive.Portal>;
}

export function DropdownMenuItem({
  className,
  variant = 'default',
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & { variant?: 'default' | 'danger' }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        'flex min-h-9 cursor-default items-center gap-2 rounded-md px-2.5 text-label outline-none select-none pointer-coarse:min-h-11',
        'data-highlighted:bg-glass-hover data-disabled:pointer-events-none data-disabled:opacity-50',
        variant === 'danger' && 'text-error',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn('px-2.5 pt-1.5 pb-1 text-helper font-medium text-fg-muted', className)}
      {...props}
    />
  );
}

export function DropdownMenuRadioGroup(
  props: ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>,
) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        'relative flex min-h-9 cursor-default items-center rounded-md pr-2.5 pl-8 text-label outline-none select-none pointer-coarse:min-h-11',
        'data-highlighted:bg-glass-hover',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex h-4 w-4 items-center justify-center text-primary">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('my-1.5 h-px bg-line', className)}
      {...props}
    />
  );
}
