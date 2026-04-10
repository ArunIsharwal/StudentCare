import jwt from "jsonwebtoken";

export const generateTokens =  async (userId) => {
  try {
    const token =   jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: '100d' });
    return token;
  } catch (error) {
    console.log("Token Generation Error: ", error);
    throw error;
  }
};
