import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const checkAuth = async (req, res, next) => {
  try {
    const accessToken = req.headers.accesstoken.split(" ")[1];
    const refreshToken = req.headers.refreshtoken.split(" ")[1];
    // console.log(accessToken);
    if (accessToken && refreshToken) {
      var decodedToken;
      try {
        decodedToken = jwt.decode(accessToken);
      } catch (err) {
        return res
          .status(401)
          .json({ message: "Invalid credentials! Please login again" });
      }
      // console.log("Decoded Token = ", decodedToken);

      // console.log("Date = ", Date.now() / 1000);
      if (decodedToken.exp <= Date.now() / 1000) {
        var decodedToken;
        try {
          decodedToken = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
          );
        } catch (err) {
          console.log(err.message);
          if (err.message === "jwt expired") {
            return res.status(401).json({
              message: "Your session has expired! Please login again",
            });
          } else {
            return res
              .status(401)
              .json({ message: "Invalid credentials! Please login again" });
          }
        }
        if (decodedToken.exp <= Date.now() / 1000) {
          return res
            .status(401)
            .json({ message: "Your session has expired! Please login again" });
        }
        const user = await User.findOne({ email: decodedToken.email });
        console.log("User found!! adding to the req body");
        req.user = user;

        //generate new access token
        const newaccessToken = jwt.sign(
          { email: decodedToken.email },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "5m" }
        );
        req.body.newaccessToken = newaccessToken;
        next();
      } else {
        //console.log("Access Token has expired!!");
        const user = await User.findOne({ email: decodedToken.email });
        req.user = user;
        next();
      }
    } else {
      return res
        .status(401)
        .json({ message: "Invalid credentials! Please login again" });
    }
  } catch (error) {
    res
      .status(401)
      .json({ message: "Something went wrong! Please login again" });
  }
};
