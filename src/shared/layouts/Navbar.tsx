import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClickOutside } from '../hooks/useClickOutside';
import { useNavbarScroll } from '../hooks/useNavbarScroll';
import logo from '@/assets/images/logo.svg';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const navContentRef = useRef<HTMLDivElement>(null);
  const navActionRef = useRef<HTMLButtonElement>(null);

  useNavbarScroll({
    header: headerRef as React.RefObject<HTMLElement>,
    navContent: navContentRef as React.RefObject<HTMLDivElement>,
    navAction: navActionRef as React.RefObject<HTMLButtonElement>
  });

  useClickOutside();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      id="header"
      ref={headerRef}
      className="fixed w-full z-30 top-0 text-white bg-transparent"
    >
      <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
        <div className="pl-4 flex items-center">
          <Link
            to="/"
            className="toggleColour text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl flex items-center"
          >
            <img src={logo} alt="MedAlert Logo" className="h-12 inline mr-2 mt-3" />
            <span className='mt-1'>MedAlert</span>
          </Link>
        </div>

        <div className="block lg:hidden pr-4">
          <button
            id="nav-toggle"
            className="flex items-center p-1 text-secondary hover:text-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring transform transition hover:scale-105 duration-300 ease-in-out"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              className="fill-current h-6 w-6"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>

        <div
          id="nav-content"
          ref={navContentRef}
          className={`w-full flex-grow lg:flex lg:items-center lg:w-auto ${
            isMenuOpen ? '' : 'hidden'
          } lg:block mt-2 lg:mt-0 bg-card lg:bg-transparent text-card-foreground lg:text-white p-4 lg:p-0 z-20 rounded-lg lg:rounded-none`}
        >
          <ul className="list-reset lg:flex justify-end flex-1 items-center">
            <li className="mr-3">
              <Link
                to="/"
                className="inline-block py-2 px-4 text-foreground lg:text-white font-bold no-underline hover:text-primary transition-colors"
              >
                Accueil
              </Link>
            </li>
            <li className="mr-3">
              <a
                href="#features"
                className="inline-block py-2 px-4 text-foreground lg:text-white no-underline hover:text-primary transition-colors"
              >
                Fonctionnalités
              </a>
            </li>
          </ul>

          <button
            id="navAction"
            ref={navActionRef}
            className="mx-auto lg:mx-0 hover:underline bg-white text-gray-800 font-bold rounded-full  py-4 px-8 shadow-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
            onClick={() => navigate('/login')}
          >
            Se connecter
          </button>
        </div>
      </div>

      <hr className="border-b border-border/25 my-0 py-0" />
    </nav>
  );
};

export default Navbar;
