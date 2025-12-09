import jwt from "jsonwebtoken";

export const generateToken = (userId, res) =>{

    const { JWT_SECRET } = process.env;
scm-history-item:c%3A%5CUsers%5CRUTUJ%20RAUT%5CDesktop%5CInstantChat?%7B%22repositoryId%22%3A%22scm0%22%2C%22historyItemId%22%3A%22165813b4a16930c261ad527a50be527350c68e00%22%2C%22historyItemParentId%22%3A%22a233f899cc7eaeadc0e44950e1dd0fc28b8ebc2e%22%2C%22historyItemDisplayId%22%3A%22165813b%22%7D    if(JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
    }

    const token = jwt.sign({userId: userId}, JWT_SECRET, {
        expiresIn: "7d",
    });
    res.cookie("jwt", token, {
        maxAge: 7*24*60*60*1000, // in millisecond: 7 days
        httpOnly: true,   // Prevents XSS attacks: cross-site scripting
        sameSite: "strict", // Prevents CSRF attacts
        secure: process.env.NODE_ENV === "development" ? false: true,
    });

    return token;
};