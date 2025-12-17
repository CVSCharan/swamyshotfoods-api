import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser } from "../models/User";
import { UserRepository } from "../repositories/UserRepository";

export class AuthService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async register(userData: Partial<IUser>): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(userData.password!, 10);
    return await this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
  }

  async login(
    userData: Partial<IUser>
  ): Promise<{ token: string; user: IUser } | null> {
    const user = await this.userRepository.findByUsername(userData.username!);
    if (!user) return null;

    const isMatch = await bcrypt.compare(userData.password!, user.password!);
    if (!isMatch) return null;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );
    return { token, user };
  }
}
