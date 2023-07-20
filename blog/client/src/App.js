import axios from "axios";
import "./App.css";
import Home from "./pages/Home";
import AddNewPost from "./pages/AddNewPost";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  AppBar,
  Toolbar,
  Button,
  ButtonGroup,
  Alert,
  Snackbar,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import HomeIcon from "@mui/icons-material/Home";
import FloatingMenu from "./components/FloatingMenu";

function App() {
  const baseURL = "http://localhost:3080";
  const popularityOptions = [1, 5, 20, 100];

  const [userId, setUserId] = useState("");

  const [selectedPopularityQuery, setSelectedPopularityQuery] = useState("");
  const [selectedTagQuery, setSelectedTagQuery] = useState("");

  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);

  const [tags, setTags] = useState({});
  const [tagsList, setTagsList] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);

  const [alertMsg, setAlertMsg] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");

  const [claps, setClaps] = useState({});
  const [userClaps, setUserClaps] = useState({});

  useEffect(() => {
    if (showAlert) {
      setTimeout(() => {
        handleAlert("", false, "");
      }, 1500);
    }
  }, [showAlert]);

  const handleAlert = (message, isShow, type) => {
    setAlertMsg(message);
    setShowAlert(isShow);
    setAlertType(type);
  };

  ///////////////////////////////////// data request /////////////////////////////////////
  axios.defaults.withCredentials = true;
  ///////////////////// get request /////////////////////

  // sets a userId cookie
  const getUser = useCallback(() => {
    axios
      .get(`${baseURL}/user`)
      .then((response) => {
        setUserId(response.data.id);
      })
      .catch((error) => {
        handleAlert(error.message, true, "error");
      });
  }, []);

  const getPosts = useCallback(() => {
    axios
      .get(`${baseURL}/posts`)
      .then((response) => {
        setAllPosts([...response.data["Posts"]]);
        setFilteredPosts([...response.data["Posts"]]);
      })
      .catch((error) => {
        handleAlert(error.message, true, "error");
      });
  }, []);

  const getFilteredPosts = (popularity, tagName, selectedTagId) => {
    const popularityUrl = popularity !== "" ? `popularity=${popularity}` : "";
    const tagNameUrl = tagName !== "" ? `&tagName=${tagName}` : "";
    axios
      .get(`${baseURL}/posts?${popularityUrl}${tagNameUrl}`)
      .then((response) => {
        if (response.data["filteredPosts"]) {
          setFilteredPosts([...response.data["filteredPosts"]]);
          setSelectedTagId(selectedTagId);
        }
      })
      .catch((error) => {
        handleAlert(error.message, true, "error");
      });
  };

  const getTags = useCallback(() => {
    axios
      .get(`${baseURL}/tags`)
      .then((response) => {
        setTags({ ...response.data["Tags"] });
        const tagsList = [];
        for (const tagName in response.data["Tags"]) {
          tagsList.push(tagName);
        }
        setTagsList(tagsList);
      })
      .catch((error) => {
        handleAlert(error.message, true, "error");
      });
  }, []);

  const getClaps = useCallback(() => {
    axios
      .get(`${baseURL}/claps`)
      .then((response) => {
        setClaps({ ...response.data["Claps"] });
        setUserClaps({ ...response.data["userClaps"] });
      })
      .catch((error) => {
        handleAlert(error.message, true, "error");
      });
  }, []);

  useEffect(() => {
    getPosts();
    getTags();
    getUser();
    getClaps();
  }, [getPosts, getTags, getUser, getClaps]);

  ///////////////////// post request /////////////////////
  const addPost = async (id, title, content, tagName) => {
    try {
      const response = await axios.post(
        `${baseURL}/posts`,
        {
          post: {
            id,
            title,
            content,
            tagName,
          },
        },
        {
          headers: {
            // to send a request with a body as json you need to use this 'content-type'
            "content-type": "application/x-www-form-urlencoded",
          },
        }
      );
      setAllPosts([...response.data["Posts"]]);
      setFilteredPosts([...response.data["Posts"]]);
      setTags({ ...response.data["Tags"] });
      setClaps({ ...response.data["Claps"] });
      return "success";
    } catch (error) {
      handleAlert(error.response.data.message, true, "error");
      return null;
    }
  };

  const addNewTag = (tagName) => {
    axios
      .post(`${baseURL}/tags/tagName/${tagName}`)
      .then((response) => {
        setTags({ ...response.data["Tags"] });
        const tagsList = [];
        for (const tagName in response.data["Tags"]) {
          tagsList.push(tagName);
        }
        setTagsList(tagsList);
        handleAlert("Tag was added successfully", true, "success");
      })
      .catch((error) => {
        handleAlert(error.message, true, "error");
      });
  };

  const addTagToPost = (tagName, postId) => {
    axios
      .post(
        `${baseURL}/tags/post`,
        {
          data: { tagName: tagName, postId: postId },
        },
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then((response) => {
        setTags({ ...response.data["Tags"] });
        handleAlert("Tag was added successfully", true, "success");
      })
      .catch((error) => {
        handleAlert(error.message, true, "error");
      });
  };

  const addClapsToPost = (postId, dataTestId) => {
    axios
      .post(`${baseURL}/claps/${postId}`)
      .then((response) => {
        setClaps(response.data["Claps"]);
        setUserClaps(response.data["userClaps"]);
        handleAlert("Clap was updated successfully", true, "success");
      })
      .catch((error) => {
        handleAlert(error.message, true, "error");
      });
  };
  ///////////////////////////////////// handle click events /////////////////////////////////////
  const handlePopularityClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (selectedOption) => {
    setAnchorEl(null);
    filterPostsByPopularity(selectedOption);
  };

  const handleHomeClick = () => {
    setFilteredPosts(allPosts);
    cleanSelectedItems();
  };

  ///////////////////////////////////// filters /////////////////////////////////////
  const filterPostsByPopularity = (minClapsNum) => {
    setSelectedPopularityQuery(`${minClapsNum}`);
    getFilteredPosts(minClapsNum, selectedTagQuery, selectedTagId);
  };

  const filterPostsByTagName = (tagName, selectedTagId) => {
    setSelectedTagQuery(`${tagName}`);
    getFilteredPosts(selectedPopularityQuery, tagName, selectedTagId);
  };

  const filterPostsByClaps = () => {
    const filteredPosts = allPosts.filter((post) => post.id in userClaps);
    setAllPosts(filteredPosts);
    setFilteredPosts(filteredPosts);
    cleanSelectedItems();
  };

  const cleanSelectedItems = () => {
    setSelectedPopularityQuery("");
    setSelectedTagQuery("");
    setSelectedTagId("");
  }

  ///////////////////////////////////// render components /////////////////////////////////////
  const renderToolBar = () => {
    return (
      <AppBar position="sticky" color="inherit">
        <Toolbar>
          <ButtonGroup variant="text" aria-label="text button group">
            <Button
              href="/"
              size="large"
              onClick={handleHomeClick}
              startIcon={<HomeIcon />}
            >
              Home
            </Button>
            <Button
              href="/add-new-post"
              size="large"
              startIcon={<AddCircleIcon />}
            >
              Add A New Post
            </Button>
          </ButtonGroup>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Enter 2023 Blog Exam
          </Typography>
          <ButtonGroup variant="text" aria-label="text button group">
            <Button
              size="large"
              onClick={filterPostsByClaps}
              data-testid="myClapsBtn"
              className={
                window.location.href !== "http://localhost:3001/add-new-post"
                  ? ""
                  : "visibilityHidden"
              }
            >
              My Claps
            </Button>
          </ButtonGroup>

          <ButtonGroup variant="text" aria-label="text button group">
            <Button
              size="large"
              startIcon={<FilterAltIcon />}
              onClick={(e) => handlePopularityClick(e)}
              data-testid="popularityBtn"
              className={
                window.location.href !== "http://localhost:3001/add-new-post"
                  ? ""
                  : "visibilityHidden"
              }
            >
              filter by Popularity
            </Button>
          </ButtonGroup>
          <FloatingMenu
            menuOptions={popularityOptions}
            anchorElement={anchorEl}
            handleMenuClose={handleMenuClose}
          />
        </Toolbar>
      </AppBar>
    );
  };

  return (
    <div className="App">
      {renderToolBar()}
      {showAlert && (
        <Snackbar open={true} data-testid="alert-snackbar">
          <Alert severity={alertType} data-testid="alert">
            {alertMsg}
          </Alert>
        </Snackbar>
      )}
      <Router>
        <Routes>
          <Route
            path="/add-new-post"
            element={<AddNewPost addNewPost={addPost} tagsList={tagsList} />}
          />
          <Route
            path="/"
            element={
              <Home
                Posts={filteredPosts}
                Tags={tags}
                tagsList={tagsList}
                Claps={claps}
                handleAddNewTag={addNewTag}
                handleAddTagToPost={addTagToPost}
                filterPostsByTagName={filterPostsByTagName}
                addClapsToPost={addClapsToPost}
                selectedTagId={selectedTagId}
                userClaps={userClaps}
                selectedPopularityQuery={selectedPopularityQuery}
                selectedTagQuery={selectedTagQuery}
                userId={userId}
              />
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
