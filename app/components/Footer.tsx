import Link from "next/link";
import { FiMail, FiGithub, FiGlobe } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="w-full flex justify-center mt-12">
      <div className="max-w-4xl w-full mx-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-6 py-5 flex items-center justify-between text-sm">
        <div className="text-muted-foreground">© {new Date().getFullYear()} 릿시네코</div>
        <div className="flex items-center gap-4">
          <a href="mailto:hello@example.com" className="flex items-center gap-2 p-2 rounded-md hover:bg-white/10 transition-colors duration-200 text-foreground hover:text-primary">
            <FiMail className="text-lg" /> Email
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-white/10 transition-colors duration-200 text-foreground hover:text-primary">
            <FiGithub className="text-lg" />
          </a>
          <Link href="/" className="p-2 rounded-md hover:bg-white/10 transition-colors duration-200 text-foreground hover:text-primary">
            <FiGlobe className="text-lg" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
