import { List } from "@mui/material";
import FloatingMenu from "../components/FloatingMenu";
import TagsCloud from "../components/TagsCloud";
import Post from "../components/Post";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function Home({
  Posts,
  Tags,
  tagsList,
  Claps,
  handleAddNewTag,
  handleAddTagToPost,
  filterPostsByTagName,
  addClapsToPost,
  selectedTagId,
  userClaps,
  selectedPopularityQuery,
  selectedTagQuery,
  userId,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const [postId, setPostId] = useState();

  ///////////////////////////////////// handle query param /////////////////////////////////////
  searchParams.get("popularity");
  searchParams.get("tagName");

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedPopularityQuery !== "") {
      params.set('popularity', selectedPopularityQuery);
    } else {
      params.delete('popularity');
    }

    if (selectedTagQuery !== "") {
      params.set('tagName', selectedTagQuery);
    } else {
      params.delete('tagName');
    }

    setSearchParams(params);
  }, [selectedPopularityQuery, selectedTagQuery, setSearchParams]);

  ///////////////////////////////////// handle tag click /////////////////////////////////////
  const handleAddTagClick = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setPostId(postId);
  };

  const handleMenuClose = (selectedOption) => {
    if (selectedOption !== "") {
      handleAddTagToPost(selectedOption, postId);
    }
    setAnchorEl(null);
  };

  ///////////////////////////////////// render components /////////////////////////////////////
  return (
    <div className="container">
      <List sx={{ width: "650px" }}>
        {Posts.map((post) => (
          <Post
            key={post.id}
            postId={post.id}
            postTitle={post.title}
            postContent={post.content}
            Tags={Tags}
            claps={Claps[post.id]}
            handleAddTagClick={handleAddTagClick}
            userId={userId}
            handleTagClick={filterPostsByTagName}
            addClapsToPost={addClapsToPost}
            selectedTagId={selectedTagId}
            clap={userClaps[post.id] ? true : false}
          />
        ))}
      </List>
      <TagsCloud
        tagsList={tagsList}
        handleAddNewTag={handleAddNewTag}
        selectedTagId={selectedTagId}
        handleTagClick={filterPostsByTagName}
      />
      <FloatingMenu
        menuOptions={tagsList}
        anchorElement={anchorEl}
        handleMenuClose={handleMenuClose}
      />
    </div>
  );
}

export default Home;
