import { Link } from "react-router-dom"
import { Logo } from "./ui/logo"

export const Header = () => {
  return (
    <Link to="https://interledger.pay" target="_blank" className="flex items-center gap-1 text-2xl cursor-pointer">
      <Logo className="h-9 w-9 flex-shrink-0 inline-flex" aria-label="Logo" />
      <span>Interledger</span>
      <span className="text-green-1 font-medium">Pay</span>
    </Link>
  );
};
Header.displayName = "Header";
