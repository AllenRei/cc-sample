const async = require("async");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const firebase = require('firebase-admin')
const {
    randomString
} = require("../utils/helpers");
const ROLES = require("../constants").ROLES;

var userSchema = new Schema({
    name: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        required: false
    },
    role: {
        type: Number,
        required: false,
        default: ROLES.USER
    },
    email: {
        type: String,
        required: false
    },
    firebaseId: {
        type: String,
        required: false,
        select: false
    },
    pointers: [{
        event: {
            type: String,
            required: false
        },
        date: {
            type: String,
            required: false
        }
    }],
    tokens: [{
        auth: {
            type: String,
            required: false,
            index: true,
            select: false
        },
        device: {
            type: String,
            required: false,
            select: false
        }
    }],
    lastSeenAt: {
        type: Number,
        required: false
    }
});

eventSchema.methods.get = async function (...args) {
    const pop = args.filter(a => typeof a === 'object' && a.populate);
    let self = this;
    let res = {};
    if (this.pop.length > 0) {
        self = await this.populate(pop.map(p => p.field).join(' '));
        pop.forEach(p => res[p] = self[p]);
    }
    args.filter(a => typeof a === 'string').forEach(a => res[a] = self[a])
    return res;
}

userSchema.statics = {
    async authorize(_id, deviceToken) {
        let token = randomString(24);
        let user = await global.model.user.findOne({
            _id
        });
        user.tokens.push({
            auth: token,
            device: deviceToken
        });
        await user.save();
        return token;
    },
    async changeDeviceToken(_id, auth, device) {
        return await global.model.user.update({
            _id
        }, {
            $set: {
                "tokens.$[i].device": device
            }
        }, {
            arrayFilters: [{
                "i.auth": auth
            }]
        });
    },
    async deauthorize(authToken) {
        return await global.model.user.update({
            tokens: {
                $elemMatch: {
                    auth: authToken
                }
            }
        }, {
            $pull: {
                tokens: {
                    $elemMatch: {
                        auth: authToken
                    }
                }
            }
        });
    },
    touch(uid) {
        const lastSeenAt = Date.now();
        global.model.user.findOneAndUpdate({
                _id: uid
            }, {
                $set: {
                    lastSeenAt
                }
            },
            err => {
                if (err) console.error(err);
            }
        );
    },
    findUserByToken(token) {
        return global.model.user.findOne({
            tokens: {
                $elemMatch: {
                    auth: token
                }
            }
        });
    },
    async sendNotificationTo(uids, payload) {
        let users = await global.model.user.find().where('_id').in(uids);
        users.forEach(async (u) => {
            try {
                u.tokens.forEach(async t => {
                    await firebase.messaging().sendToDevice(t.device, payload);
                })
            } catch (e) {
                console.error("FAILED TO SEND NOTIFICATION: " + e);
            }
        })

    }
};

module.exports = mongoose.model("User", userSchema);