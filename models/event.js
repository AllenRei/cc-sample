const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId }  = Schema.Types;
const { ROLES, ACTION_TYPES } = require("../constants");
const { MedianeStrategy } = require('../utils/calculations');

const Transaction = require(`${global.basepath}/models/schemas/transaction`);
const Comment = require(`${global.basepath}/models/schemas/comment`);
const Tag = require(`${global.basepath}/models/schemas/tag`);
const Action = require(`${global.basepath}/models/schemas/action`);
const File = require(`${global.basepath}/models/schemas/file`);

const eventSchema = new Schema({
  title: { type: String  },
  description: { type: String, required: false, index: false, maxlength: 256 },
  picture: { type: String, required: false },
  invite_code : { type: String, default : null },
  createdAt: { type: Number },
  updatedAt : { type: Number },
  calculation: {
    total: { type: Number, default: 0 },
    transfers: [
      {
        from: { type: ObjectId, ref: "User" },
        to: { type: ObjectId, ref: "User" },
        amount: { type: Number }
      }
    ]
  },
  admins: [{ type: ObjectId, ref: "User" }],
  members: [{ type: ObjectId, ref: "User" }],
  transactions: [ Transaction ],
  tags: [ Tag ],
  files: [ File ],
  actions : [ Action ],
  thread: [ Comment ],
});

eventSchema.methods.touch = function() {
  this.update({ _id : this._id }, { $set: { updatedAt : Date.now() } });
}

eventSchema.methods.get = async function(...args) {
  const pop = args.filter(a => typeof a === 'object' && a.populate);
  let self = this;
  let res = {};
  if(this.pop.length > 0) {
    self = await this.populate(pop.map(p => p.field).join(' '));
    pop.forEach(p => res[p] = self[p]);
  }
  args.filter(a => typeof a === 'string').forEach(a => res[a] = self[a])
  return res;
}

eventSchema.methods.getFullInfo() = async function() {
  let event = await this.populate("participants");
  event = event.toObject();
  event.participants = event.participants.map(p => {
    p.role = ROLES.USER;
    if (event.admins.find(a => a == p._id)) p.role = ROLES.EVENT_ADMIN;
    return p;
  });
  return event;
}

eventSchema.methods.calculate = async function() {
    let actions = this.actions;

    const payments = actions.filter(a => a.action_type === ACTION_TYPES.ADD_PAYMENT);
    const handTransfers = actions.filter(a => a.action_type === ACTION_TYPES.TRANSFER_CASH);
    const payers = uniqueElementsById(payments.map(a => a.author));
    this.calculation.transfers = MedianeStrategy(payers, payments, handTransfers);
    try {
        await this.save();
    } catch (e) {
        console.error(e);
    }
}

eventSchema.statics = {
  async getUsersAllEvents(uid){
    return await global.model.find({ participants : uid }).sort({
      updatedAt : -1
    });
  },
  async applyInvite(code, user) {
      let event = await global.model.event.findOne({ invite_code : code });
      if(!event) return new Error("Can't apply invite");
      if(event.participants.find(p => p.toString() === user._id.toString())) return;
      event.participants.push(user._id);
      return await event.save();
  }
};

module.exports = mongoose.model("Event", eventSchema);