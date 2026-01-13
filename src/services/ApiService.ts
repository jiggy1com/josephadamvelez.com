export class MailObject {
    smtpUser: string | undefined;
    smtpTo: string | undefined;
    smtpPort: string | undefined;
    smtpHost: string | undefined;
    smtpPass: string | undefined;
    smtpCC: string | undefined;

    constructor() {
        this.smtpUser = process.env.MAIL_IN_A_BOX_USERNAME;
        this.smtpTo = process.env.MAIL_IN_A_BOX_TO;
        this.smtpCC = '';
        this.smtpPass = process.env.MAIL_IN_A_BOX_PASSWORD;
        this.smtpHost = process.env.MAIL_IN_A_BOX_HOST;
        this.smtpPort = '587';
    }
}

// export class ApiService {
//
//     constructor(res, data) {
//         this.res = res;
//     }
//
//     success(data) {
//         this.res.status(200).json({
//             success: true,
//             data: data
//         })
//     }
//
//     error(err) {
//         console.log('err', err);
//         this.res.status(500).json({
//             success: false,
//             message: err
//         })
//     }
//
// }
