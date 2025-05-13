/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { BarChart2, Settings, ShoppingBag, ShoppingCart, Users, Menu, TentTree } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { MapPin } from 'lucide-react';
import { Tags } from "lucide-react"; 

const SIDEBAR_ITEMS = [
    { name: "Overview", icon: BarChart2, color: "#6366f1", href: "/" },
    { name: "Category", icon: Tags, color: "#A855F7", href: "/categories" },
    { name: "Products", icon: ShoppingBag, color: "#8B5CF6", href: "/products" },
    { name: "Users", icon: Users, color: "#EC4899", href: "/users" },
    { name: "Campsite Owners", icon: TentTree, color: "#EC4899", href: "/campsiteowners" },
    { name: "Campsites", icon: MapPin, color: "#6366f1", href: "/campsites" },
    { name: "Orders", icon: ShoppingCart, color: "#F59E0B", href: "/orders" },
    { name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" },
];

const Sidebar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false); 
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)");

        const handleMediaQueryChange = (e) => {
            setIsMobile(e.matches);
            setIsSidebarOpen(!e.matches);
        };

        handleMediaQueryChange(mediaQuery);
        mediaQuery.addEventListener("change", handleMediaQueryChange);

        return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
    }, []);

    const handleLogout = () => {
        try {
            logout();
            toast.success("Logged out successfully");
            navigate("/login");
        } catch (error) {
            toast.error("Error logging out");
            console.error("Logout error:", error);
        }
    };

    return (
        <>
            <motion.div
                className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-20'}`}
                animate={{ width: isSidebarOpen ? 220 : 80 }}
            >
                <div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
                    <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit"
                        disabled={isMobile} 
                    >
                        <Menu size={26} />
                    </motion.button>

                    <nav className="mt-8 flex-grow">
                        {SIDEBAR_ITEMS.map((item) => (
                            <Link key={item.href} to={item.href}>
                                <motion.div
                                    className="flex items-center font-medium p-4 mb-2 text-sm rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <item.icon size={20} style={{ color: item.color, minWidth: "20px" }} />
                                    <AnimatePresence>
                                        {isSidebarOpen && (
                                            <motion.span
                                                className="ml-4 whitespace-nowrap"
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2, delay: 0.3 }}
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-700">
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded transition duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;
