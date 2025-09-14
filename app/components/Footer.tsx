import Link from "next/link";
import { FiMail, FiGithub, FiGlobe } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="w-full flex justify-center mt-12">
      <div className="max-w-4xl w-full mx-4 bg-white/6 backdrop-blur-md border border-white/10 rounded-xl px-6 py-4 flex items-center justify-between text-sm">
        <div>© {new Date().getFullYear()} 릿시네코</div>
        <div className="flex items-center gap-4">
          <a href="mailto:hello@example.com" className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5">
            <FiMail /> Email
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-md hover:bg-white/5">
            <FiGithub />
          </a>
          <Link href="/" className="p-2 rounded-md hover:bg-white/5">
            <FiGlobe />
          </Link>
        </div>
      </div>
    </footer>
  );
}
