export const logoutAdmin = (navigate) => {
    // Remove stored admin credentials
    localStorage.removeItem("builder360_token");
    localStorage.removeItem("builder360_user");

    // Also clear session storage in case it contains old credentials
    sessionStorage.removeItem("builder360_token");
    sessionStorage.removeItem("builder360_user");

    // Redirect to the admin login page
    navigate("/admin/login", { replace: true });
  };