const { Octokit } = require("@octokit/rest");
const sendgrid = require('@sendgrid/mail');

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const site = body.site;
  const email = body.email;
  if (!site || !email) return { statusCode:400, body: JSON.stringify({message:'bad'}) };

  const token = Math.random().toString(36).slice(2,12);
  const octo = new Octokit({ auth: process.env.GITHUB_TOKEN });
  // create issue
  const issue = await octo.rest.issues.create({
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    title: `WeBring request: ${site}`,
    body: JSON.stringify({ site, email, token })
  });

  // send email via SendGrid
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
  const approveUrl = `${process.env.BASE_URL}/.netlify/functions/approve?issue=${issue.data.number}&token=${token}&action=approve`;
  const rejectUrl = `${process.env.BASE_URL}/.netlify/functions/approve?issue=${issue.data.number}&token=${token}&action=reject`;

  await sendgrid.send({
    to: process.env.ADMIN_EMAIL,
    from: process.env.ADMIN_EMAIL,
    subject: `New WeBring request: ${site}`,
    html: `Approve: <a href="${approveUrl}">Approve</a><br>Reject: <a href="${rejectUrl}">Reject</a>`
  });

  return { statusCode:200, body: JSON.stringify({ message: 'request submitted' }) };
};

