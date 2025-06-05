// We’ll create a middleware that checks the user’s role and allows access based on the following rules:

// admin: Can access all routes.

// employee: Can access employee and guest routes.

// guest: Can only access guest routes.

export function authorize(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user.role || req.role;

    // Admin has access to everything
    if (userRole === "admin") {
      return next();
    }

    // Check if the user's role is allowed
    if (allowedRoles.includes(userRole)) {
      return next();
    }

    // Deny access if the role is not allowed
    return res.status(403).json({ message: "Access denied" });
  };
}
