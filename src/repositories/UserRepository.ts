import User, { IUser } from "../models/User";

export class UserRepository {
  async create(user: Partial<IUser>): Promise<IUser> {
    return await User.create(user);
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }
}
