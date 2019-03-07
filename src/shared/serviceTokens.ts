import { Token } from "typedi";
import { IAuthService } from "../interfaces/IAuth.service";

export const authServiceToken = new Token<IAuthService>();
