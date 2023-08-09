import { IconProps } from './icon';

export default function InfoIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
    >
      <path
        className='fill-current'
        fillRule="evenodd"
        d="M12 20.2a8.2 8.2 0 1 1 0-16.4 8.2 8.2 0 0 1 0 16.4ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm10.435 3.17 1.2-4.975-3.475.375-.146.596.556.103c.19.039.307.097.35.175.05.073.052.196.008.368l-.848 3.545c-.137.552-.098.964.117 1.236.214.271.582.407 1.104.407.424 0 .836-.073 1.236-.22.4-.15.707-.34.922-.57l.153-.64c-.121.091-.258.154-.41.188a1.738 1.738 0 0 1-.394.052c-.18 0-.3-.054-.358-.162-.059-.108-.064-.267-.015-.479Zm-.607-6.275c.229.199.517.298.863.298.239 0 .458-.052.658-.155.2-.104.358-.242.476-.414.117-.173.175-.365.175-.576a.943.943 0 0 0-.344-.744C13.427 7.101 13.142 7 12.8 7a1.38 1.38 0 0 0-.936.336c-.253.225-.38.494-.38.809 0 .297.115.548.344.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}