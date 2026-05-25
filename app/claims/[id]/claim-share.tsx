"use client";

import ShareButtons from "../../share-buttons";

export default function ClaimShareSection({
  title,
  text,
  claimId,
}: {
  title: string;
  text: string;
  claimId: string;
}) {
  return <ShareButtons title={title} text={text} claimId={claimId} />;
}
