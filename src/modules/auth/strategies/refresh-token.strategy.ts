import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
   constructor(config: ConfigService) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         secretOrKey: config.getOrThrow<string>("JWT_REFRESH_SECRET"),
         passReqToCallback: true,
      })
   }

   validate(req: Request, payload: { sub: string; email: string; role: string }) {
      const authHeader = req.headers.authorization;
      if (!authHeader) throw new UnauthorizedException('Token is required');

      const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7).trim() 
      : authHeader.trim();
      return { ...payload, refreshToken: token };
   }
}