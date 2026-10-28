import Link from 'next/link';
import type { ComponentProps } from 'react';

type SharedProps = { iconOnly?: boolean };
type ButtonProps = SharedProps &
  (
    | (ComponentProps<'button'> & { href?: never })
    | (ComponentProps<'a'> & { href: string })
  );

/** One appearance for actions and links styled as actions. */
export function Button({
  className = '',
  iconOnly = false,
  ...props
}: ButtonProps) {
  const classes = `inline-flex shrink-0 items-center justify-center gap-4 rounded-full bg-ink text-sm font-medium text-white transition-colors hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-50 ${iconOnly ? 'size-11 p-0' : 'px-6 py-3.5'} ${className}`;
  if (props.href !== undefined) {
    return (
      <Link
        {...(props as ComponentProps<'a'> & { href: string })}
        className={classes}
      />
    );
  }
  return (
    <button
      type="button"
      {...(props as ComponentProps<'button'>)}
      className={classes}
    />
  );
}
