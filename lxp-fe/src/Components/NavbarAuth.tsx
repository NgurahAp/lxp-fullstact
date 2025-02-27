import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoChevronDownOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import ProfileBox from "./ProfileBox";
import { LuLogOut } from "react-icons/lu";
import { HiMiniSquaresPlus } from "react-icons/hi2";
import { IoIosMenu } from "react-icons/io";
import { UserData } from "../types/auth";
import { useAuth } from "../hooks/useAuth";

const NavbarAuth: React.FC = () => {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { logout } = useAuth();

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const handleCloseProfileMenu = () => {
    setShowProfileMenu(false);
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Pelatihan-ku", path: "/pelatihanku" },
    { name: "Nilai & Sertifikat", path: "/score" },
    { name: "Sekilas Ilmu", path: "/sekilas-ilmu" },
  ];

  useEffect(() => {
    const getUserProfile = () => {
      try {
        const storedUser = localStorage.getItem("user_data");
        if (storedUser) {
          const userData: UserData = JSON.parse(storedUser);
          setProfileData(userData);
        } else {
          console.log("Data profil tidak ditemukan di localStorage");
        }
      } catch (error) {
        console.error("Error parsing user profile:", error);
      }
    };

    getUserProfile();
  }, []);

  const getCurrentPageName = () => {
    const currentPath = location.pathname;
    const currentPage = navItems.find((item) =>
      currentPath.startsWith(item.path)
    );
    return currentPage?.name;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentPageName = getCurrentPageName();
  return (
    <nav className="fixed top-0 left-0 w-full z-10 bg-white shadow-md">
      <div className="flex justify-between px-4 md:px-24 h-16 items-center">
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <img
              src="/navbar/logo.png"
              className="w-32 md:w-36 bg-white bg-opacity-20 rounded"
              alt="Logo"
            />

            {/* Only show dropdown if we're on a valid page */}
            {currentPageName && (
              <div className="relative md:hidden" id="navbar-dropdown">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-1 text-gray-700 hover:text-sky-700 focus:outline-none  "
                >
                  <span className="font-medium text-xs">{currentPageName}</span>
                  <IoChevronDownOutline
                    className={`transition-transform duration-200 ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showDropdown && (
                  <div className="absolute top-full -left-3 mt-1 w-40 bg-white rounded-md shadow-l5 py-2 z-20">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`block px-4 py-2 text-xs font-medium rounded-md border ${
                          location.pathname.startsWith(item.path)
                            ? "bg-blue-500 text-white border-blue-500 m-2"
                            : "text-gray-700 border-transparent hover:bg-sky-50 mx-2 hover:text-sky-700 hover:border-sky-700"
                        }`}
                        onClick={() => setShowDropdown(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4 md:space-x-8">
          {!isMobile && (
            <>
              <Link to={"/allFeatures"}>
                <img src="/navbar/square.png" className="px-1 w-6" alt="" />
              </Link>
              <img src="/navbar/moon.png" className="px-1 w-7" alt="" />
              <img src="/navbar/bell.png" className="px-1 w-7" alt="" />
              <img src="/navbar/separator.png" className="px-4 " alt="" />
              <button
                onClick={toggleProfileMenu}
                className="relative w-10 h-10 rounded-full overflow-hidden"
              >
                {profileData?.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-yellow-300 rounded-full text-gray-700 font-semibold">
                    {profileData?.name
                      ? profileData.name
                          .split(" ")
                          .slice(0, 2) // Ambil maksimal 2 kata pertama
                          .map((word) => word[0]) // Ambil huruf pertama setiap kata
                          .join("")
                          .toUpperCase() // Ubah ke huruf besar
                      : "?"}
                  </div>
                )}
              </button>

              {showProfileMenu && (
                <ProfileBox
                  offset="right-[5rem]"
                  onClose={handleCloseProfileMenu}
                />
              )}
            </>
          )}
          {isMobile && (
            <button onClick={() => setIsOpen(!isOpen)} className="text-3xl">
              <IoIosMenu />
            </button>
          )}
        </div>
      </div>

      {!isMobile && (
        <div className="bg-sky-700">
          <div className="flex h-16 items-center space-x-8 md:space-x-14 px-4 md:px-24">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-semibold text-sm md:text-base ${
                  location.pathname.startsWith(item.path)
                    ? "text-green-300"
                    : "text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Navbar hamburger */}
      {isMobile && isOpen && (
        <div className="">
          <div className="p-4 flex items-center border-b">
            <img
              src={profileData?.avatar}
              className="w-12 h-12 rounded-lg"
              alt="Profile"
            />
            <div className="pl-3 flex flex-col">
              <p className="font-medium text-sm">{profileData?.name}</p>
              <p className="text-xs text-gray-500">{profileData?.email}</p>
            </div>
          </div>

          {/* Tombol "Semua Fitur" */}
          <div className="p-4">
            <Link
              to={"/allFeatures"}
              onClick={() => setIsOpen(false)}
              className="w-full bg-yellow-500 text-white font-medium text-sm py-2 rounded-lg flex items-center justify-center hover:bg-yellow-600"
            >
              <span>Semua Fitur</span>
              <span className="ml-2">
                <HiMiniSquaresPlus />
              </span>
            </Link>
          </div>

          {/* Menu Navigasi */}
          <div className="flex flex-col">
            {/* Beranda */}
            <Link
              to="/"
              className={`flex items-center text-sm px-5 py-3   `}
              onClick={() => setIsOpen(false)}
            >
              <HiMiniSquaresPlus className="mr-3 text-2xl text-blue-500" />
              <span>Beranda</span>
            </Link>
            <Link
              to=""
              className={`flex items-center text-sm px-5 py-3 `}
              onClick={() => setIsOpen(false)}
            >
              <CgProfile className="mr-3 text-2xl text-green-500" />
              <span>Profile</span>
            </Link>
            <Link
              to="/"
              className={`flex items-center text-sm px-5 py-3 pb-8`}
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
            >
              <LuLogOut className="mr-3 text-2xl text-red-500" />
              <span>Logout</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarAuth;
