import * as Redis from "ioredis";
import { Token } from "typedi";
import { IAuthService } from "@interfaces/IAuthService";
import { IUsersService } from "@interfaces/IUsersService";
import { TokenManager } from "@shared/TokenManager";
import { IPhonebookService } from "@interfaces/IPhonebookService";

export const authServiceToken = new Token<IAuthService>();
export const usersServiceToken = new Token<IUsersService>();
export const phonebookServiceToken = new Token<IPhonebookService>();

export const redisToken = new Token<Redis.Redis>();
export const tokenManagerToken = new Token<TokenManager>();
