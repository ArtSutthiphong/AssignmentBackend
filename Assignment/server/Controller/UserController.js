import bcrypt from 'bcrypt';
import User from '../Model/UserModel.js';
import { checkPasswordFormat, checkEmailFormat, checkdisplayName, checkbirthDate } from '../Util/Util.js';

const PAGE_LIMIT = 3;

export let create = (req, res) => {
    if (!req.body) return res.status(400).json({ message: 'ต้องการข้อมูล' });
    let { email, password } = req.body;
    if (!checkPasswordFormat(password)) return res.status(400).json({ message: 'รหัสผ่านไม่แข็งแรงตามเกณฑ์' });
    if (!checkEmailFormat(email)) return res.status(400).json({ message: 'ที่อยู่อีเมลไม่ถูกต้องตามรูปแบบที่ควรจะเป็น' });

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            if (err) return res.status(400).json(err);
            let date = new Date();
            var newUser = new User({
                email,
                password: hash,
                createdAt: date,
            })

            User.init()
                .then(function () {
                    newUser.save()
                        .then(user => {
                            return res.status(201).json({
                                message: `สมัครสมาชิกด้วยอีเมล ${user.email} เสร็จสิ้น`,
                            });
                        }).catch(err => {
                            if (err.keyPattern) {
                                return res.status(400).json({ message: 'พบที่อยู่อีเมลซ้ำกับของเดิมในระบบ' });
                            }
                            else return res.status(500).send({
                                errors: { global: "User : create", err }
                            });
                        });
                });
        });
    })
};

export let login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(401).json({ message: 'ข้อมูลไม่ถูกต้อง' });
    else {
        User.findOne({ email: email })
            .then(user => {
                if (!user) { return res.status(401).json({ message: 'ไม่พบผู้ใช้งานในระบบ' }); }
                else {
                    if (user.checkPassword(password)) { return res.status(200).json({ user: user.returnLogin() }) }
                    else { return res.status(401).json({ message: 'รหัสผ่านไม่ถูกต้อง' }); };
                }
            })
            .catch(err => res.status(500).json({ error: err }));
    }
}

export let putProfile = (req, res) => {
    let { displayName, birthDate } = req.body;
    let updatedAt = new Date();

    if (!displayName || !birthDate) return res.status(400).json({ message: 'ต้องการข้อมูล' });
    if (!checkdisplayName(displayName)) return res.status(400).json({ message: 'ชื่อผู้ใช้งานยาวเกินไป' });
    if (!checkbirthDate(birthDate)) return res.status(400).json({ message: 'วันเกิด ใช้วันอนาคต' });

    User.findByIdAndUpdate(req.user._id,
        { $set: { displayName, birthDate, updatedAt } },
        { new: true, runValidators: true })
        .then(user => {
            if (!user) {
                return res.status(404).json({ message: `ไม่พบผู้ใช้งาน${_id}` })
            }
            user.save().then(result => res.status(200).json({ user: result.toProfileJSON() }))
                .catch(err => res.status(400).json({ message: err }))
        })
        .catch(err => res.status(400).json({ message: err }))
}

export let putPassword = (req, res) => {
    let { password } = req.body;
    let { _id } = req.user;
    let updatedAt = new Date();

    if (!password) return res.status(400).json({ message: 'ต้องการข้อมูล' });
    if (!checkPasswordFormat(password)) return res.status(400).json({ message: 'รหัสผ่านไม่แข็งแรงตามเกณฑ์' });

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
            User.findByIdAndUpdate(_id,
                { $set: { password: hash, updatedAt } },
                { new: true, runValidators: true })
                .then(user => {
                    if (!user) {
                        return res.status(404).json({ message: `ไม่พบผู้ใช้งาน${_id}` })
                    }
                    user.save().then(result => res.status(200).json({ user: result.toProfileJSON() }))
                        .catch(err => res.status(400).json({ message: err }))
                })
                .catch(err => res.status(400).json({ message: err }))
        })
    })

}

export let patchUser = (req, res) => {
    let { displayName, birthDate, password } = req.body;
    let { role } = req.user;
    let { id } = req.params;
    let updatedAt = new Date();

    if (!displayName && !birthDate && !password) return res.status(400).json({ message: 'ต้องการข้อมูล' });
    if (!displayName && !checkdisplayName(displayName)) return res.status(400).json({ message: 'ชื่อผู้ใช้งานยาวเกินไป' });
    if (!birthDate && !checkPasswordFormat(password)) return res.status(400).json({ message: 'รหัสผ่านไม่แข็งแรงตามเกณฑ์' });
    if (!password && !checkbirthDate(birthDate)) return res.status(400).json({ message: 'วันเกิด ใช้วันอนาคต' });

    if (role !== 'admin') return res.status(403).json({ message: 'ผู้ใช้งานไม่ได้เป็น admin' })
    else {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
                User.findById(id)
                    .then(user => {
                        if (!user) {
                            return res.status(404).json({ message: `ไม่พบผู้ใช้งาน${_id}` })
                        }
                        if (displayName) user.displayName = displayName;
                        if (birthDate) user.birthDate = birthDate;
                        if (password) user.password = hash;
                        user.updatedAt = updatedAt;
                        user.save().then(result => res.status(200).json({ user: result.toProfileJSON() }))
                            .catch(err => res.status(400).json({ message: err }))
                    })
                    .catch(err => res.status(400).json({ message: err }))
            })
        })
    }


}

export const getUsers = (req, res) => {
    let { page } = req.query;
    let total = 0;
    if (isNaN(page) || parseInt(page) <= 0) return res.status(400).json({ message: 'จำนวนหน้า ไม่ใช่จำนวน (NaN) หรือเป็นค่าที่น้อยกว่าหรือเท่ากับ 0)' });
    
    User.count().then(count => total = count)
    User.find({}, { "_id": 1, "email": 1, "displayName": 1, "birthDate": 1 }).skip(PAGE_LIMIT * (page - 1)).limit(PAGE_LIMIT)
        .then(array => {
            if (array.length == 0) { return res.status(404).json({ message: 'ไม่มีข้อมูล' }) }
            let data = {
                "perPage": PAGE_LIMIT,
                "page": parseInt(page),
                "total": total,
                "data": array,
            }
            return res.status(200).json(data)
        }).catch(err => {
            return res.status(500).json({ message: err });
        });
};

export const getUserbyId = (req, res) => {
    let { id } = req.params;

    User.findOne({ _id: id })
        .then(user => {
            if (!user) { return res.status(404).json({ message: 'หาผู้ใช้งานไม่เจอ' }) }
            return res.status(200).json(user.toProfileJSON())
        }).catch(err => {
            return res.status(500).json({ message: err });
        });
};
