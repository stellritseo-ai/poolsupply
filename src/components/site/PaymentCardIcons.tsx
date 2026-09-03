import React from "react";
import paymentCardsImg from "@/assets/payment-cards.png";

export { paymentCardsImg };

export function PaymentCardBadges({
  className = "flex items-center",
  imgClassName = "h-6 sm:h-7 w-auto max-w-full object-contain",
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={className}>
      <img
        src={paymentCardsImg}
        alt="Accepted Payment Methods: Visa, MasterCard, Discover, American Express, JCB, Cirrus, Delta"
        className={imgClassName}
        loading="eager"
      />
    </div>
  );
}

export function VisaIcon({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 38 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Visa"
    >
      <rect width="38" height="24" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <path
        d="M15.4 16.5l2.4-11.2h2.6l-2.4 11.2h-2.6zm9.3-11c-.5-.2-1.4-.4-2.5-.4-2.7 0-4.6 1.4-4.6 3.4 0 1.5 1.4 2.3 2.4 2.8 1.1.5 1.4.8 1.4 1.3 0 .7-.9 1-1.7 1-.1 0-1.6-.1-2.5-.6l-.4-.2-.4 1.9c.6.3 1.8.5 2.9.5 2.8 0 4.7-1.4 4.7-3.5 0-1.2-.7-2.1-2.3-2.8-.9-.5-1.5-.8-1.5-1.3 0-.4.5-.9 1.5-.9.9 0 1.6.2 2.1.4l.3.1.5-1.9zm6.1 7.2l1.1-2.9c0-.1.2-.5.3-.8l.2.8.6 2.9h-2.2zm3.3-7.4h-2c-.6 0-1.1.2-1.3.8l-3.8 8.9h2.7l.5-1.5h3.4l.3 1.5h2.4l-2.2-9.7zm-18.7 0l-2.5 6.6-.3-1.4c-.4-1.5-1.7-3.1-3.2-3.9l2.1 7.9h2.8l4.1-9.2h-3z"
        fill="#1434CB"
      />
      <path
        d="M9.8 5.3H5.6l-.1.4c3.2.8 5.3 2.8 6.2 5.1l-.9-4.4c-.2-.7-.7-1-1-.1z"
        fill="#F7B600"
      />
    </svg>
  );
}

export function MastercardIcon({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 38 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mastercard"
    >
      <rect width="38" height="24" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="15" cy="12" r="6.2" fill="#EB001B" />
      <circle cx="23" cy="12" r="6.2" fill="#F79E1B" />
      <path
        d="M19 7.6a6.18 6.18 0 0 0-2.4 4.4 6.18 6.18 0 0 0 2.4 4.4 6.18 6.18 0 0 0 2.4-4.4A6.18 6.18 0 0 0 19 7.6z"
        fill="#FF5F00"
      />
    </svg>
  );
}

export function AmexIcon({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 38 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="American Express"
    >
      <rect width="38" height="24" rx="4" fill="#006FCF" stroke="#0058A6" strokeWidth="1" />
      <path
        d="M5.5 15.5l3.2-7h2.2l3.2 7h-2.1l-.6-1.5h-3.2l-.6 1.5H5.5zm3.3-3.2h2l-1-2.4-1 2.4zm8.2 3.2V8.5h2.4l1.8 3.6 1.8-3.6h2.4v7h-1.8v-4.5l-1.7 3.3h-1.4l-1.7-3.3v4.5H17zm11.2 0V8.5h4.6v1.7h-2.8v1.1h2.5v1.6h-2.5v1h2.9v1.6h-4.7zm6.8 0l2.2-3.4-2-3.6h2.2l1 2 1-2h2.2l-2 3.6 2.2 3.4h-2.3l-1.1-2-1.1 2h-2.3z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function DiscoverIcon({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 38 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Discover"
    >
      <rect width="38" height="24" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
      <g transform="translate(3, 7)">
        <path
          d="M0 0h2.4c1.8 0 3 1.1 3 2.9 0 1.9-1.2 3.1-3 3.1H0V0zm1.7 4.5h.7c.9 0 1.4-.6 1.4-1.5 0-.9-.5-1.5-1.4-1.5h-.7v3zM7 0h1.7v6H7V0zm4 4.5c.3.3.8.5 1.4.5.6 0 1-.2 1-.6 0-1-2.5-.7-2.5-2.6 0-1.1.9-1.8 2.2-1.8.8 0 1.4.2 1.8.5L14.3 2c-.3-.2-.7-.4-1.2-.4-.6 0-.8.2-.8.5 0 .9 2.5.6 2.5 2.5 0 1.2-.9 1.9-2.3 1.9-.9 0-1.7-.3-2.2-.7l.7-1.3z"
          fill="#1F2937"
        />
        <circle cx="18" cy="3" r="3.2" fill="#FF6000" />
        <path
          d="M23 0l1.4 4.6L25.8 0h1.8l-2.3 6h-1.8L21.2 0H23zm5 0h3.5v1.5h-1.8v.8h1.6v1.4h-1.6v.8h1.9V6H28V0zm4.2 0h2.2c1.2 0 1.9.6 1.9 1.7 0 .8-.5 1.3-1.1 1.5l1.3 2.8h-1.8l-1.1-2.5h-.7V6h-1.7V0h1zm.7 2.4h.6c.5 0 .8-.2.8-.6 0-.4-.3-.6-.8-.6h-.6v1.2z"
          fill="#1F2937"
        />
      </g>
    </svg>
  );
}
