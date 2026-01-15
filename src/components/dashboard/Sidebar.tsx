"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiGrid,
  FiHome,
  FiLogOut,
  FiSettings,
  FiUser,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import styles from "./Sidebar.module.scss";
import { useAuthStore } from "@/store/auth";

const menuItems = [
  { name: "Dashboard", icon: FiGrid, path: "/dashboard" },
  { name: "Projects", icon: FiHome, path: "/dashboard/projects" },
  { name: "Profile", icon: FiUser, path: "/dashboard/profile" },
  { name: "Settings", icon: FiSettings, path: "/dashboard/settings" },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <div className={styles.header}>
        <button
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
        {!isCollapsed && user ? (
          <div className={styles.userProfile}>
            <div className={styles.avatar}>{user?.username?.[0]?.toUpperCase() || "U"}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.username || "Guest"}</span>
              <span className={styles.userRole}>{user?.role || "User"}</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn} title="Sign Out">
              <FiLogOut />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className={styles.logoutBtnCollapsed}
            title={`Sign Out (${user?.username || "User"})`}
          >
            <FiLogOut />
          </button>
        )}
      </div>
    </aside>
  );
}
