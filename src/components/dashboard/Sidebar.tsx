"use client";

import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiAward,
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiHome,
  FiImage,
  FiInfo,
  FiLayout,
  FiLogOut,
} from "react-icons/fi";
import styles from "./Sidebar.module.scss";
import { ThemeToggle } from "@/components/ThemeToggle";

const menuItems = [
  { name: "Home", icon: FiHome, path: "/" },
  { name: "About", icon: FiInfo, path: "/dashboard/about" },
  { name: "Work", icon: FiBriefcase, path: "/dashboard/work" },
  { name: "Blog", icon: FiFileText, path: "/dashboard/blog" },
  { name: "Certification", icon: FiAward, path: "/dashboard/certifications" },
  { name: "Gallery", icon: FiImage, path: "/dashboard/gallery" },
  { name: "Thumbnail", icon: FiLayout, path: "/dashboard/thumbnail" },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.header}>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={styles.collapseBtn}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={styles.icon} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={`${styles.themeToggle} ${isCollapsed ? styles.themeToggleCollapsed : ""}`}>
          <ThemeToggle />
        </div>
        {user ? (
          isCollapsed ? (
            <button
              type="button"
              className={styles.logoutBtnCollapsed}
              onClick={logout}
              title="Logout"
            >
              <FiLogOut />
            </button>
          ) : (
            <div className={styles.userProfile}>
              <div className={styles.avatar}>{user?.username?.[0]?.toUpperCase() || "U"}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.username || "Guest"}</span>
                <span className={styles.userRole}>{user?.role || "User"}</span>
              </div>
              <button type="button" className={styles.logoutBtn} onClick={logout} title="Logout">
                <FiLogOut />
              </button>
            </div>
          )
        ) : null}
      </div>
    </aside>
  );
}
