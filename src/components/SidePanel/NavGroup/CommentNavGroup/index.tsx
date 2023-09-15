import BaseNavGroup from "../BaseNavGroup";

const CommentNavGroup: React.FC = () => {
  const comments: string[] = [];

  return (
    <BaseNavGroup
      data-cy="comment"
      defaultMessage="Add a comment to this log file"
      glyph="SMS"
      items={comments}
      navGroupTitle="Comments"
    >
      {" "}
    </BaseNavGroup>
  );
};

export default CommentNavGroup;
