import Link from "next/link";
import { FiMail, FiGithub, FiGlobe } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="w-full mt-12">
<div className="w-full mx-0 bg-white/5 backdrop-blur-md border-t border-white/10 rounded-none px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-base space-y-4 sm:space-y-0">
        <div className="text-muted-foreground">© {new Date().getFullYear()} 릿시네코</div>
        <div className="flex items-center gap-4">
          <a href="mailto:hello@example.com" className="flex items-center gap-2 p-2 rounded-md hover:bg-white/10 transition-colors duration-200 text-foreground hover:text-primary">
            <FiMail className="text-lg" /> Email
          </a>
          <a href="https://github.com/litsyneko" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-white/10 transition-colors duration-200 text-foreground hover:text-primary">
            <FiGithub className="text-lg" />
          </a>
          <Link href="/privacy" className="p-2 rounded-md hover:bg-white/10 transition-colors duration-200 text-foreground hover:text-primary">
            개인정보처리방침
          </Link>
          <Link href="/" className="p-2 rounded-md hover:bg-white/10 transition-colors duration-200 text-foreground hover:text-primary">
            <FiGlobe className="text-lg" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
