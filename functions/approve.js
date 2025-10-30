const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const { issue, token, action } = event.queryStringParameters || {};
  const octo = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const issueData = await octo.rest.issues.get({
    owner: process.env.GITHUB_OWNER, repo: process.env.GITHUB_REPO, issue_number: Number(issue)
  });

  const parsed = JSON.parse(issueData.data.body);
  if (parsed.token !== token) return { statusCode:403, body: 'bad token' };

  if (action === 'approve') {
    const path = 'data/sites.json';
    const file = await octo.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER, repo: process.env.GITHUB_REPO, path
    });
    const sha = file.data.sha;
    const content = Buffer.from(file.data.content, 'base64').toString();
    const data = JSON.parse(content);
    if (!data.sites.includes(parsed.site)) data.sites.push(parsed.site);
    const newContent = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    await octo.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path,
      message: `Add site ${parsed.site} via webring approval`,
      content: newContent,
      sha
    });

    await octo.rest.issues.createComment({
      owner: process.env.GITHUB_OWNER, repo: process.env.GITHUB_REPO, issue_number: Number(issue),
      body: `Approved and added ${parsed.site}.`
    });
    await octo.rest.issues.update({
      owner: process.env.GITHUB_OWNER, repo: process.env.GITHUB_REPO, issue_number: Number(issue),
      state: 'closed'
    });
    return { statusCode: 200, body: 'approved' };
  } else {
    // reject
    await octo.rest.issues.createComment({ owner: process.env.GITHUB_OWNER, repo: process.env.GITHUB_REPO, issue_number: Number(issue), body: `Rejected`});
    await octo.rest.issues.update({ owner: process.env.GITHUB_OWNER, repo: process.env.GITHUB_REPO, issue_number: Number(issue), state: 'closed' });
    return { statusCode:200, body: 'rejected' };
  }
};
