import * as React from 'react';

export interface IPageIconProps {
  className?: string;
}

export const PageIcon: React.FunctionComponent<IPageIconProps> = ({
  className
}: React.PropsWithChildren<IPageIconProps>) => {
  return (
    <svg className={className || ''} fill="currentColor" aria-hidden="true" width="1em" height="1em" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 7H6v2h8V7Zm-2 5h2v1h-2v-1ZM6 3a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6ZM5 7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7Zm7 4h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1Zm-7 .5c0-.28.22-.5.5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Zm.5 1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1 0-1Z" fill="currentColor"></path>
    </svg>
  );
};