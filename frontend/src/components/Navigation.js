import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';

// Mobile bottom nav (5 items — most-used)
const mobileNavItems = [
    { path: '/',        label: 'Home',    icon: '/assets/icons/House.svg',      lucide: null, exact: true },
    { path: '/explore', label: 'Explore', icon: '/assets/icons/Ajna.svg',       lucide: null },
    { path: '/ritual',  label: 'Ritual',  icon: '/assets/icons/Mindfulness.svg',lucide: null },
    { path: '/goals',   label: 'Goals',   icon: '/assets/icons/Lotus.svg',      lucide: null },
    { path: '/progress',label: 'Progress',icon: '/assets/icons/Calendar.svg',   lucide: null },
];

// Desktop top nav (all items including Settings)
const desktopNavItems = [
    { path: '/',        label: 'Home',     icon: '/assets/icons/House.svg',      lucide: null, exact: true },
    { path: '/explore', label: 'Explore',  icon: '/assets/icons/Ajna.svg',       lucide: null },
    { path: '/ritual',  label: 'Ritual',   icon: '/assets/icons/Mindfulness.svg',lucide: null },
    { path: '/goals',   label: 'Goals',    icon: '/assets/icons/Lotus.svg',      lucide: null },
    { path: '/progress',label: 'Progress', icon: '/assets/icons/Calendar.svg',   lucide: null },
    { path: '/settings',label: 'Settings', icon: null,                           lucide: Settings },
];

const NavIcon = ({ item, isActive }) => {
    if (item.lucide) {
        const Icon = item.lucide;
        return <Icon size={22} className={isActive ? 'text-aligna-primary' : 'text-aligna-text-secondary'} strokeWidth={1.5} />;
    }
    return (
        <img
            src={item.icon}
            alt={item.label}
            className={`w-6 h-6 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-40'}`}
        />
    );
};

const Navigation = () => {
    const location = useLocation();

    const isActive = (path, exact) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <nav
                data-testid="bottom-navigation"
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-aligna-border"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
                <div className="flex items-center justify-around px-1 py-1">
                    {mobileNavItems.map((item) => {
                        const active = isActive(item.path, item.exact);
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                data-testid={`nav-${item.label.toLowerCase()}`}
                                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[56px] min-h-[48px] justify-center active:bg-aligna-surface-secondary ${active ? 'bg-aligna-surface-secondary/60' : ''}`}
                            >
                                <NavIcon item={item} isActive={active} />
                                <span className={`text-[10px] font-body font-medium transition-colors duration-300 ${active ? 'text-aligna-primary' : 'text-aligna-text-secondary'}`}>
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            {/* Desktop Top Navigation */}
            <nav
                data-testid="top-navigation"
                className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-aligna-border pt-[env(safe-area-inset-top)]"
            >
                <div className="max-w-5xl mx-auto w-full px-8 py-3 md:py-4 flex items-center justify-between">
                    {/* Logo */}
                    <NavLink to="/" className="flex items-center gap-2">
                        <img src="/assets/icons/Lotus.svg" alt="Aligna" className="w-7 h-7" />
                        <span className="font-heading text-2xl text-aligna-text tracking-tight">Aligna</span>
                    </NavLink>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1">
                        {desktopNavItems.map((item) => {
                            const active = isActive(item.path, item.exact);
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    data-testid={`nav-desktop-${item.label.toLowerCase()}`}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm transition-all duration-300 ${
                                        active
                                            ? 'bg-aligna-surface-secondary text-aligna-text font-medium'
                                            : 'text-aligna-text-secondary hover:text-aligna-text hover:bg-aligna-surface-secondary/50'
                                    }`}
                                >
                                    <NavIcon item={item} isActive={active} />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navigation;
