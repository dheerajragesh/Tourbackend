// middleware/adminMiddleware.js

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Not Authorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin Access Required",
    });
  }

  next();
};

export default adminMiddleware;