import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

type JwtPayload = {
   sub: string;
   email: string;
   role: string;
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
   constructor(config: ConfigService) {
      super({
         //jwtFromRequest: ExtractJwt.fromHeader('authorization'),
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         secretOrKey: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      })
   }

   validate(payload: JwtPayload) {
      return { userId: payload.sub, email: payload.email, role: payload.role }
   }
}