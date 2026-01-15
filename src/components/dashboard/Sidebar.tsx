"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiHome, FiLogOut, FiSettings, FiUser } from "react-icons/fi";
import styles from "./Sidebar.module.scss";

const menuItems = [
  { name: "Dashboard", icon: FiGrid, path: "/dashboard" },
  { name: "Projects", icon: FiHome, path: "/dashboard/projects" },
  { name: "Profile", icon: FiUser, path: "/dashboard/profile" },
  { name: "Settings", icon: FiSettings, path: "/dashboard/settings" },
];

import { useAuthStore } from "@/store/auth";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.avatar} style={{ width: 32, height: 32, fontSize: "0.8rem" }}>
          P
        </div>
        <span className={styles.logoText}>Portofolio Admin</span>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              <item.icon className={styles.icon} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>{user?.username?.[0]?.toUpperCase() || "U"}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.username || "Guest"}</span>
            <span className={styles.userRole}>{user?.role || "User"}</span>
          </div>
          <FiLogOut className={styles.icon} style={{ marginLeft: "auto", color: "#ef4444" }} />
        </div>
      </div>
    </aside>
  );
}
