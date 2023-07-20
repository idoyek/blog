import { Button } from "@mui/material";
const { useState } = require("react");

const PostContent = ({ postContent }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const maxContentLengthAllowed = 300;

  const toggleContentVisibility = () => {
    setShowFullContent(true);
  };

  if (showFullContent || postContent.length <= maxContentLengthAllowed) {
    return postContent;
  } else {
    const truncatedContent = postContent.substring(0, maxContentLengthAllowed) + " ...";
    return (
      <>
        {truncatedContent}
        <Button
          onClick={toggleContentVisibility}
          data-testid="postContent-readMoreButton"
        >
          Read more
        </Button>
      </>
    );
  }
};

export default PostContent;