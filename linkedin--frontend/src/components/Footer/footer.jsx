import React from 'react';

const Footer = () => {
  const links = [
    'About',
    'Accesbility',
    'Help Center',
    'Privacy & Terms',
    'Ad Choices',
    'Advertising',
    'Business Services',
    'Get the LinkedIn app',
    'More',
  ];

  return (
    <footer className="w-full py-4 px-2 text-center">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
        {links.map((link, idx) => (
          <a
            key={idx}
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hover:text-sky-400 hover:underline transition-colors"
          >
            {link}
          </a>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
        <span className="font-bold text-sky-500 font-sans flex items-center gap-0.5">
          <span className="bg-[#0a66c2] text-white text-[9px] px-1 rounded font-bold">in</span>
          <span className="text-[#0a66c2] dark:text-sky-400 font-semibold ml-0.5">LinkedIn</span>
        </span>
        <span>LinkedIn Corporation © {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
};

export default Footer;