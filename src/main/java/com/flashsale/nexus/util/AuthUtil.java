package com.flashsale.nexus.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import java.util.Date;

public class AuthUtil {
    private static final String SECRET_KEY = "your-very-secure-secret-key";

    public static boolean isValid(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}