import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";

import User from "../models/users";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string;
  let decoded: any;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        ignoreExpiration: true,
      }); //give user details from token

      const user: any = await User.findById(decoded.userID);

      if (user) {
        //@ts-ignore
        req["user"] = user;

        next();
      } else {
        throw "Error";
      }
    } catch (err) {
      console.log(err, "auth-error");
      if (err instanceof TokenExpiredError) {
        // Generate a new token here
        console.log(decoded, "decoded2");
        if (decoded) {
          const user: any = await User.findById(decoded?.userID);

          if (user) {
            const newToken = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET
            ); // Generate a new token

            res.setHeader("Authorization", `Bearer ${newToken}`);

            // Continue to the next middleware
            next();
          } else {
            res.status(401).json({
              message: "User not found",
              status: "401",
            });
            return;
          }
        } else {
          res.status(401).json({
            message: "Token is not valid",
            status: "401",
          });
          return;
        }
      } else {
        res.status(401).json({
          message: "Authorization required",
          status: "401",
        });
        return;
      }
    }
  } else {
    res.status(401).json({
      message: "Authorization required",
      status: "401",
    });
    return;
  }
};
