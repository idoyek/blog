import {
  ListItem,
  ListItemButton,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Typography,
} from "@mui/material";
import ClappingIcon from "./assets/ClappingIcon";
import AddTagButton from "./AddTagButton";
import Tag from "./Tag";
import PostContent from "./PostContent"

function Post({
  postId,
  postTitle,
  postContent,
  Tags,
  claps,
  handleAddTagClick,
  handleTagClick,
  addClapsToPost,
  selectedTagId,
  clap,
  userId,
}) {
  const getTagsByPostId = (postID) => {
    const tagsArr = [];
    for (const tagName in Tags) {
      if (Tags[tagName][postID]) {
        tagsArr.push(tagName);
      }
    }
    return tagsArr;
  };

  const tagsNameArr = getTagsByPostId(postId);
  const isTag = tagsNameArr.length > 0 ? true : false;

  const addClappingAmount = (dataTestId) => {
    addClapsToPost(postId, dataTestId);
  };

  return (
    <ListItem
      alignItems="flex-start"
      key={postId}
      className="post"
      data-testid={`post-${postId}`}
    >
      <Card className="post">
        <ListItemButton disableGutters>
          <CardContent>
            <Typography
              variant="h5"
              gutterBottom
              data-testid={`postTitle-${postId}`}
            >
              {postTitle}
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              data-testid={`postContent-${postId}`}
            >
              <PostContent postContent={postContent}/>
            </Typography>
          </CardContent>
        </ListItemButton>
        <CardActions>
          <AddTagButton
            dataTestId={`postAddTagBtn-${postId}`}
            onClick={(e) => handleAddTagClick(e, postId)}
          />
          {isTag &&
            tagsNameArr.map((tagName) => (
              <Tag
                key={tagName}
                tagName={tagName}
                postId={postId}
                handleTagClick={handleTagClick}
                selectedTagId={selectedTagId}
              />
            ))}
          <IconButton
            aria-label="clapping"
            size="small"
            data-testid={`postClapsBtn-${postId}`}
          >
            <ClappingIcon
              clap={clap}
              dataTestId={`postClappingIcon-${postId}`}
              addClappingAmount={addClappingAmount}
            />
          </IconButton>
          <Typography variant="string" data-testid={`postClapsNum-${postId}`}>
            {claps}
          </Typography>
        </CardActions>
      </Card>
    </ListItem>
  );
}

export default Post;
