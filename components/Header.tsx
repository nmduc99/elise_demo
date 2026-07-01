"use client";

import MobileNav from "./MobileNav";
import HeaderTopBar from "./header/HeaderTopBar";
import MainNavigation from "./header/MainNavigation";

const Header = () => {
    return (
        <header className="sticky z-50 top-0">
            <HeaderTopBar />
            <div className="bg-orange-100 h-[48px] relative">
                <div className="flex justify-between items-center w-full h-[48px]">
                    <MainNavigation shopType={null} />
                    <MobileNav />
                </div>
            </div>
        </header>
    );
};

export default Header;
