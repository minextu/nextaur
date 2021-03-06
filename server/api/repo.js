const to = require('await-to-js').default;
const Repo = require('../repo.js');

/**
 * Set appropriate response code and error text
 * @param  {Error} err Error object
 * @return {Array}     Answer Object
 */
function handleError(err, res) {
  let answer = {};

  if (err.name === "Exists") { res.status(409); }
  else if (err.name === "InvalidCharacters") { res.status(412); }
  else if (err.name === "NotLoggedIn") { res.status(401); }
  else {
    console.error(err);
    res.status(500);
  }
  answer.error = err.name;
  answer.errorText = err.message;

  res.send(answer);
}

exports.set = function setRoutes(app, login) {
  /**
   * @api        {post} /v1/repo/create Create Repository
   * @apiName    addRepo
   * @apiVersion 0.1.0
   * @apiGroup   Repo
   * @apiUse     Permissions
   *
   * @apiParam {String} name  Repo name
   *
   * @apiSuccess {bool} success  Status
   *
   * @apiError  Exists             Repo has already been added
   * @apiError  InvalidCharacters  Repo name does contain invalid characters
   **/
  app.post("/api/v1/repo/create", async (req, res) => {
    let answer = {};

    let repo = new Repo();

    // get parameters
    let name = req.body.name ? req.body.name : null;

    // check if user is logged in
    let [err] = await to(login(req.session));
    if (err) {
      handleError(err, res);
      return;
    }

    try {
      repo.setName(name);
    }
    catch (err) {
      handleError(err, res);
      return;
    }

    // save the repo
    answer.success = true;
    [err] = await to(repo.save());
    if (err) {
      handleError(err, res);
      return;
    }

    res.send(answer);
  });

  /**
   * @api        {get} /v1/repo/list Get all Repos
   * @apiName    listRepos
   * @apiVersion 0.1.0
   * @apiGroup   Repo
   *
   * @apiSuccess {Array} repos  A list of all repos
   **/
  app.get("/api/v1/repo/list", async (req, res) => {
    let answer = {};

    let repo = new Repo();

    let [err, repos] = await to(repo.getAll());
    if (err) {
      handleError(err, res);
      return;
    }

    let repoList = [];
    for (let i in repos) {
      repoList[repoList.length] = { id: repos[i].getId(), name: repos[i].getName() };
    }
    answer.repos = repoList;

    res.send(answer);
  });
};
