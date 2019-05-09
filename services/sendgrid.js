const sgMail = require('@sendgrid/mail');

const createInviteTemplate = url => `You have been invited to the CashCrowd event! <br/>
You can register via link <a href="${url}">${url}</a>`

function createMassageFor(mail, template, title) {
    return {
        to: mail,
        from: global.config.adminEmail,
        subject: title,
        html: template,
    }
}

module.exports = {
    sendInviteEmailTo(mail, url) {
        const msg = createMassageFor(mail, createInviteTemplate(url), 'Invite to Cash Crowd');
        sgMail.send(msg);
    },
    init() {
        sgMail.setApiKey(global.config.SENDGRID);
    }
}