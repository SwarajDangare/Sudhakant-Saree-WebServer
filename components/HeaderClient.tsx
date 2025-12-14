'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MobileMenu from './MobileMenu';
import CartIcon from './CartIcon';
import UserMenu from './UserMenu';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Section {
    id: string;
    name: string;
    slug: string;
    categories: Category[];
}

interface HeaderClientProps {
    sectionsWithCategories: Section[];
}

export default function HeaderClient({ sectionsWithCategories }: HeaderClientProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Text color logic:
    // If scrolled: Text is dark (standard)
    // If not scrolled (transparent): Text should be white (assuming hero image is dark) OR standard if hero is light.
    // The user requested "transparent feature". Usually implies overlay.
    // Assuming overlay on Hero: Text needs to be readable.
    // Let's use standard dark text for "scrolled" (white bg) and white text for "transparent" (hero bg).
    // AND: On hover, always use the maroon accent.

    const headerClass = isScrolled
        ? 'bg-white border-b border-gray-100 shadow-sm'
        : 'bg-transparent border-transparent';

    const textColorClass = isScrolled
        ? 'text-gray-900'
        : 'text-white';

    const logoColor = isScrolled ? 'text-[#d4af37]' : 'text-[#d4af37]'; // Keep Gold/Saffron for logo always? Or White? Let's stick to Gold/Saffron as it contrasts well often.

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <span className={`text-2xl font-bold tracking-wide ${logoColor} uppercase font-serif`}>
                            Sudhakant Sarees
                        </span>
                    </Link>

                    {/* Desktop Navigation - Centered */}
                    <nav className="hidden lg:flex items-center gap-8">
                        <Link href="/shop" className={`text-xs font-bold uppercase tracking-widest ${textColorClass} hover:text-[#9d2235] transition-colors`}>
                            New Arrivals
                        </Link>

                        {/* Section Dropdowns */}
                        {sectionsWithCategories.map((section) => (
                            <div key={section.id} className="relative group h-20 flex items-center">
                                <Link
                                    href={`/categories/${section.slug}`}
                                    className={`text-xs font-bold uppercase tracking-widest ${textColorClass} hover:text-[#9d2235] transition-colors flex items-center`}
                                >
                                    {section.name}
                                    {section.categories.length > 0 && (
                                        <svg className={`w-3 h-3 ml-1 ${isScrolled ? 'text-gray-400' : 'text-white/70'} group-hover:text-[#9d2235]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </Link>

                                {/* Dropdown for categories */}
                                {section.categories.length > 0 && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white border border-gray-100 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
                                        <div className="py-2">
                                            {section.categories.map((category) => (
                                                <Link
                                                    key={category.id}
                                                    href={`/products/${category.slug}`}
                                                    className="block px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#9d2235] transition-colors uppercase tracking-wide"
                                                >
                                                    {category.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <Link href="/about" className={`text-xs font-bold uppercase tracking-widest ${textColorClass} hover:text-[#9d2235] transition-colors`}>
                            About
                        </Link>
                    </nav>

                    {/* Right Icons */}
                    <div className="flex items-center gap-1">
                        {/* User - moved to first */}
                        <div className={`hidden sm:block ${textColorClass} hover:text-[#9d2235]`}>
                            <UserMenu />
                        </div>

                        {/* Search */}
                        <button className={`p-2 ${textColorClass} hover:text-[#9d2235] transition-colors`} aria-label="Search">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Wishlist */}
                        <Link href="/wishlist" className={`p-2 ${textColorClass} hover:text-[#9d2235] transition-colors`} aria-label="Wishlist">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </Link>

                        {/* Cart */}
                        <div className={`${textColorClass} hover:text-[#9d2235]`}>
                            <CartIcon />
                        </div>

                        {/* Mobile Menu Trigger */}
                        <div className={`lg:hidden ml-2 ${textColorClass}`}>
                            <MobileMenu sectionsWithCategories={sectionsWithCategories} />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
