const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
const cors = require("cors");

const { baseUrl, maxNumOfClapsPerUserPerPost, maxTitleLength } = require("../constants");
const { filterPosts } = require("./utils/utils");
const { Posts } = require("./model/Posts");
const { Tags } = require("./model/Tags");
const { Claps } = require("./model/Claps");
const { UsersClaps } = require("./model/UsersClaps");

const app = express();
const port = 3080;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
//app.use(cors());

const corsOptions = {
  origin: `${baseUrl.client}`,
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/", cors(corsOptions), (req, res) => {
  res.send("Welcome to your Wix Enter exam!");
});

app.get("/user", cors(corsOptions), (req, res) => {
  const userId = req.cookies?.userId || uuidv4();
  res.cookie("userId", userId).send({ id: userId });
});

const validateUser = (req, res, next) => {
  const userId = req.cookies?.userId;
  if (!userId) {
    res.status(403).end();
    return;
  }
  next()
}

///////////////////////////////////// Posts /////////////////////////////////////

app.get("/posts", cors(corsOptions), (req, res) => {

  const isQueryEmpty = Object.keys(req.query).length === 0;

  const { startIndex, endIndex } = req.query;

  if (!isQueryEmpty){
    let filteredPosts = [...Posts];

    Object.entries(req.query).forEach(([key, value]) => {
      filteredPosts = filterPosts(filteredPosts, key, value);
    })
    res.send({ filteredPosts });
    return;
  }

  const postsToSent = Posts.slice(startIndex, endIndex);

  res.send({ Posts });
});

app.post("/posts", cors(corsOptions), validateUser, (req, res) => {
  const userId = req.cookies?.userId;
  const { post } = req.body;

  if (!post) {
    res.status(400).json({ message: "Bad request" }).end();
    return;
  }

  const { id, title, content, tagName } = post;

  if (!id || !title || !content) {
    res.status(400).json({ message: "Bad request" }).end();
    return;
  }

  if (title.length > maxTitleLength){
    res.status(400).json({ message: `ERROR: Title length is bigger than ${maxTitleLength}` }).end();
    return;
  }

  // add tagName to post
  if (tagName !== undefined && tagName !== "") {
    Tags[tagName] = {
      ...Tags[tagName],
      [id]: true,
    };
  }

  const newPost = {
    id: id,
    title: title,
    content: content,
    userId: userId,
  };

  Claps[id] = 0;

  Posts.push(newPost);
  res.send({ Posts, Tags, Claps }).status(200).end();
});

///////////////////////////////////// Tags /////////////////////////////////////
app.get("/tags", cors(corsOptions), (req, res) => {
  res.send({ Tags });
});

app.post("/tags/tagName/:tagName", cors(corsOptions), validateUser, (req, res) => {
  const { tagName } = req.params;
  if (Tags[tagName]) {
    res.status(400).end();
    return;
  }
  Tags[tagName] = {};
  res.send({ Tags }).status(200).end();
});

app.post("/tags/post", cors(corsOptions), validateUser, (req, res) => {
  const { data } = req.body;


  if (!data || !data.tagName || !data.postId || !Tags[tagName]){
    res.status(400).json({ message: "Bad request" }).end();
    return;
  }


  if (!data) {
    res.status(400).json({ message: "Bad request" }).end();
    return;
  }

  const { tagName, postId } = data;

  if (!tagName || !postId) {
    res.status(400).json({ message: "Bad request" }).end();
    return;
  }

  if (!Tags[tagName]) {
    res.status(400).json({ message: "Bad request" }).end();
    return;
  }

  Tags[tagName] = {
    ...Tags[tagName],
    [postId]: true,
  };

  res.send({ Tags }).status(200).end();
});

///////////////////////////////////// Claps /////////////////////////////////////

app.get("/claps", cors(corsOptions), validateUser, (req, res) => {
  const userId = req.cookies?.userId;
  const userClaps = UsersClaps[userId];
  res.send({ Claps, userClaps });
});

app.post("/claps/:postId", cors(corsOptions), validateUser, (req, res) => {
  const userId = req.cookies?.userId;
  const { postId } = req.params;
  if (!postId) {
    res.status(400).json({ message: "Bad request" }).end();
    return;
  }

  // Check if the userId exists in UsersClaps
  if (!UsersClaps[userId]) {
    UsersClaps[userId] = {};
  }

  // Check if the value for the postId is less than maxNumOfClapsPerUserPerPost
  const userClaps = UsersClaps[userId];
  if (
    Object.values(userClaps).length < maxNumOfClapsPerUserPerPost &&
    !(postId in userClaps)
  ) {
    userClaps[postId] = true;
    Claps[postId] = Claps[postId] + 1;
  }

  res.send({ Claps, userClaps }).status(200).end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
