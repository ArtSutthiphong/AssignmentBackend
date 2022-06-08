import passport from "passport";
import passportJWT from 'passport-jwt';
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

import User from '../Model/UserModel.js';

export const jwtPassport = () => {
    let params = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("bearer"),
        secretOrKey: process.env.JWT_SECRET,
    }

    var strategy = new JwtStrategy(params, (jwt_payload, done) => {
        User.findOne({ email: jwt_payload.email })
            .then(user => {
                if (user) { return done(null, user); }
                return done(null, false, "Invalid User");
            })

            .catch(err => {
                return done(err, false, {
                    message: "Invalid Token Credential"
                });
            })
    });

    passport.use(strategy); // make passport use a specified strategy
    return {
        initialize: () => passport.initialize(),
        authenticate: (withSession = false) =>
            passport.authenticate('jwt', { session: withSession })
    }
};