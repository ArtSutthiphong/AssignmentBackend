import * as mongooseDef from "mongoose";
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import { jwtSecret } from "../config/jwtConfig.js";

let mongoose = mongooseDef.default;

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, minlength: [40] },
    displayName: { type: String, maxlength: [100], default: null },
    birthDate: { type: Date, default: null },
    role: { type: String, required: true, default: 'member' },
    createdAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null },
});

userSchema.methods.checkPassword = function (txtPassword) {
    return bcrypt.compareSync(txtPassword, this.password);
}

userSchema.methods.returnLogin = function () {
    let genJWT = this.generateJWT();
    return {
        _id: this._id,
        email: this.email,
        role: this.role,
        token: "bearer " + genJWT.token,
        expiresIn: genJWT.expiresIn,
    };
};

userSchema.methods.generateJWT = function () {
    const expiresIn = 7200; // 2 hours
    return {
        token: jsonwebtoken.sign({
            _id: this._id,
            email: this.email,
            role: this.role,
        },
            jwtSecret, { expiresIn }),
        expiresIn: expiresIn
    }
}

userSchema.methods.toProfileJSON = function () {
    return {
        _id: this._id,
        displayName: this.displayName,
        email: this.email,
        birthDate: this.birthDate,
    };
};

let User = mongoose.model('User', userSchema, 'users');
export default User;