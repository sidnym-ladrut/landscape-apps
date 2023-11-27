import React from 'react';
import { IconProps } from './icon';

export default function PlaneIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.6924 2.55989C21.8217 1.41349 20.5868 0.611498 19.5921 1.19589L2.93769 10.9806C1.57446 11.7815 1.72881 13.7999 3.19794 14.3843L10.6068 17.3311L16.3123 22.9009C17.4437 24.0053 19.3504 23.3253 19.5276 21.7542L21.6924 2.55989ZM3.84949 12.5326L19.8141 3.15311L17.7389 21.5525C17.7355 21.5827 17.7266 21.5964 17.7199 21.6044C17.7108 21.6154 17.6952 21.6276 17.6731 21.6355C17.6511 21.6433 17.6312 21.6438 17.6173 21.641C17.607 21.639 17.5915 21.6341 17.5697 21.6128L12.0887 16.2624L14.392 11.5138C14.5204 11.2491 14.1655 11.0186 13.9759 11.2436L10.5102 15.3556L3.86319 12.7117C3.83491 12.7005 3.82412 12.6883 3.81812 12.6797C3.80993 12.6681 3.80223 12.6498 3.80044 12.6264C3.79865 12.6031 3.80349 12.5838 3.80981 12.5711C3.81444 12.5617 3.82325 12.548 3.84949 12.5326Z"
        className="fill-current"
      />
    </svg>
  );
}
