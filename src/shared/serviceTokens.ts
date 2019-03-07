import { Token } from "typedi";
import { IAuthService } from "../interfaces/IAuth.service";
import { IUsersService } from "../interfaces/IUsers.service";

export const authServiceToken = new Token<IAuthService>();
export const usersServiceToken = new Token<IUsersService>();
